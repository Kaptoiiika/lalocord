#include <audioclient.h>
#include <audioclientactivationparams.h>
#include <mmdeviceapi.h>
#include <windows.h>

#include <stdio.h>
#include <stdlib.h>

// {94ea2b94-e9cc-49e0-c0ff-ee64ca8f5b90}
static const GUID kAgileObjectId = {0x94ea2b94, 0xe9cc, 0x49e0, {0xc0, 0xff, 0xee, 0x64, 0xca, 0x8f, 0x5b, 0x90}};

static bool writeAll(const BYTE* data, DWORD size) {
  HANDLE output = GetStdHandle(STD_OUTPUT_HANDLE);
  while (size > 0) {
    DWORD written = 0;
    if (!WriteFile(output, data, size, &written, nullptr) || written == 0) return false;
    data += written;
    size -= written;
  }
  return true;
}

static bool writeSilence(DWORD size) {
  BYTE zeros[4096] = {};
  while (size > 0) {
    DWORD chunk = size < sizeof(zeros) ? size : sizeof(zeros);
    if (!writeAll(zeros, chunk)) return false;
    size -= chunk;
  }
  return true;
}

class ActivationHandler : public IActivateAudioInterfaceCompletionHandler, public IAgileObject {
  LONG references_ = 1;
  HANDLE completed_;

 public:
  HRESULT result = E_FAIL;
  IAudioClient* client = nullptr;

  ActivationHandler() { completed_ = CreateEventW(nullptr, TRUE, FALSE, nullptr); }

  STDMETHODIMP QueryInterface(REFIID id, void** object) override {
    if (id == __uuidof(IUnknown) || id == __uuidof(IActivateAudioInterfaceCompletionHandler)) {
      *object = static_cast<IActivateAudioInterfaceCompletionHandler*>(this);
      AddRef();
      return S_OK;
    }
    if (id == kAgileObjectId) {
      *object = static_cast<IAgileObject*>(this);
      AddRef();
      return S_OK;
    }
    *object = nullptr;
    return E_NOINTERFACE;
  }

  STDMETHODIMP_(ULONG) AddRef() override { return InterlockedIncrement(&references_); }

  STDMETHODIMP_(ULONG) Release() override {
    ULONG count = InterlockedDecrement(&references_);
    if (count == 0) delete this;
    return count;
  }

  STDMETHODIMP ActivateCompleted(IActivateAudioInterfaceAsyncOperation* operation) override {
    HRESULT activate = E_FAIL;
    IUnknown* unknown = nullptr;
    result = operation->GetActivateResult(&activate, &unknown);
    if (SUCCEEDED(result)) result = activate;
    if (SUCCEEDED(result) && unknown) {
      unknown->QueryInterface(__uuidof(IAudioClient), reinterpret_cast<void**>(&client));
    }
    if (unknown) unknown->Release();
    SetEvent(completed_);
    return S_OK;
  }

  bool Wait() { return WaitForSingleObject(completed_, 5000) == WAIT_OBJECT_0; }
};

static int captureExcludedProcess(DWORD processId) {
  AUDIOCLIENT_ACTIVATION_PARAMS params = {};
  params.ActivationType = AUDIOCLIENT_ACTIVATION_TYPE_PROCESS_LOOPBACK;
  params.ProcessLoopbackParams.TargetProcessId = processId;
  params.ProcessLoopbackParams.ProcessLoopbackMode = PROCESS_LOOPBACK_MODE_EXCLUDE_TARGET_PROCESS_TREE;

  PROPVARIANT activateParams;
  PropVariantInit(&activateParams);
  activateParams.vt = VT_BLOB;
  activateParams.blob.cbSize = sizeof(params);
  activateParams.blob.pBlobData = reinterpret_cast<BYTE*>(&params);

  ActivationHandler* handler = new ActivationHandler();
  IActivateAudioInterfaceAsyncOperation* operation = nullptr;
  HRESULT hr = ActivateAudioInterfaceAsync(
    VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK,
    __uuidof(IAudioClient),
    &activateParams,
    handler,
    &operation
  );
  if (FAILED(hr) || !handler->Wait() || FAILED(handler->result) || !handler->client) {
    fprintf(stderr, "loopback activate failed: %08lX\n", FAILED(hr) ? hr : handler->result);
    if (operation) operation->Release();
    handler->Release();
    return 1;
  }
  if (operation) operation->Release();

  IAudioClient* client = handler->client;
  WAVEFORMATEX format = {};
  format.wFormatTag = WAVE_FORMAT_PCM;
  format.nChannels = 2;
  format.nSamplesPerSec = 48000;
  format.wBitsPerSample = 16;
  format.nBlockAlign = 4;
  format.nAvgBytesPerSec = 48000 * 4;

  HANDLE sampleReady = CreateEventW(nullptr, FALSE, FALSE, nullptr);
  hr = client->Initialize(
    AUDCLNT_SHAREMODE_SHARED,
    AUDCLNT_STREAMFLAGS_LOOPBACK | AUDCLNT_STREAMFLAGS_EVENTCALLBACK | AUDCLNT_STREAMFLAGS_AUTOCONVERTPCM,
    0,
    0,
    &format,
    nullptr
  );
  IAudioCaptureClient* capture = nullptr;
  if (SUCCEEDED(hr)) hr = client->SetEventHandle(sampleReady);
  if (SUCCEEDED(hr)) hr = client->GetService(__uuidof(IAudioCaptureClient), reinterpret_cast<void**>(&capture));
  if (SUCCEEDED(hr)) hr = client->Start();
  if (FAILED(hr) || !capture) {
    fprintf(stderr, "loopback start failed: %08lX\n", hr);
    if (capture) capture->Release();
    client->Release();
    handler->Release();
    CloseHandle(sampleReady);
    return 1;
  }

  while (WaitForSingleObject(sampleReady, INFINITE) == WAIT_OBJECT_0) {
    UINT32 packetFrames = 0;
    bool failed = false;
    while (SUCCEEDED(capture->GetNextPacketSize(&packetFrames)) && packetFrames > 0) {
      BYTE* data = nullptr;
      UINT32 frames = 0;
      DWORD flags = 0;
      hr = capture->GetBuffer(&data, &frames, &flags, nullptr, nullptr);
      if (FAILED(hr)) {
        failed = true;
        break;
      }
      DWORD bytes = frames * format.nBlockAlign;
      bool wrote = (flags & AUDCLNT_BUFFERFLAGS_SILENT) != 0 ? writeSilence(bytes) : writeAll(data, bytes);
      capture->ReleaseBuffer(frames);
      if (!wrote) {
        failed = true;
        break;
      }
    }
    if (failed) break;
  }

  client->Stop();
  capture->Release();
  client->Release();
  handler->Release();
  CloseHandle(sampleReady);
  return 0;
}

int main(int argc, char** argv) {
  if (argc < 2) {
    fprintf(stderr, "loopback process id is missing\n");
    return 1;
  }

  char* end = nullptr;
  unsigned long processId = strtoul(argv[1], &end, 10);
  if (!processId || end == argv[1]) {
    fprintf(stderr, "loopback process id is invalid\n");
    return 1;
  }

  HRESULT com = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
  if (FAILED(com)) {
    fprintf(stderr, "loopback com failed: %08lX\n", com);
    return 1;
  }

  int code = captureExcludedProcess(static_cast<DWORD>(processId));
  CoUninitialize();
  return code;
}
