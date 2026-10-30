import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type CaptureOutput = {
  index: number
  x: number
  y: number
  width: number
  height: number
}

// ddagrab output_idx is EnumOutputs on the first DXGI adapter, not Electron's display list.
// Output 0 is often the Windows primary, while getAllDisplays()[0] is another monitor.
const listScript = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class DxgiCaptureOutputs {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int left; public int top; public int right; public int bottom; }
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct DXGI_OUTPUT_DESC {
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string DeviceName;
    public RECT DesktopCoordinates;
    public int AttachedToDesktop;
    public int Rotation;
    public IntPtr Monitor;
  }
  [UnmanagedFunctionPointer(CallingConvention.StdCall)]
  public delegate int EnumAdapters1(IntPtr self, uint index, out IntPtr adapter);
  [UnmanagedFunctionPointer(CallingConvention.StdCall)]
  public delegate int EnumOutputs(IntPtr self, uint index, out IntPtr output);
  [UnmanagedFunctionPointer(CallingConvention.StdCall)]
  public delegate int GetDesc(IntPtr self, ref DXGI_OUTPUT_DESC desc);
  [UnmanagedFunctionPointer(CallingConvention.StdCall)]
  public delegate uint Release(IntPtr self);
  [DllImport("dxgi.dll")]
  public static extern int CreateDXGIFactory1(ref Guid riid, out IntPtr ppFactory);
  public static string List() {
    Guid iid = new Guid("770aae78-f26f-4dba-a829-253c83d1b387");
    IntPtr factory;
    int hr = CreateDXGIFactory1(ref iid, out factory);
    if (hr < 0 || factory == IntPtr.Zero) return "";
    IntPtr vtable = Marshal.ReadIntPtr(factory);
    EnumAdapters1 enumAdapters = Marshal.GetDelegateForFunctionPointer<EnumAdapters1>(Marshal.ReadIntPtr(vtable, 12 * IntPtr.Size));
    StringBuilder builder = new StringBuilder();
    for (uint adapterIndex = 0; adapterIndex < 8; adapterIndex++) {
      IntPtr adapter;
      hr = enumAdapters(factory, adapterIndex, out adapter);
      if (hr < 0 || adapter == IntPtr.Zero) break;
      IntPtr adapterVtable = Marshal.ReadIntPtr(adapter);
      EnumOutputs enumOutputs = Marshal.GetDelegateForFunctionPointer<EnumOutputs>(Marshal.ReadIntPtr(adapterVtable, 7 * IntPtr.Size));
      int count = 0;
      for (uint outputIndex = 0; outputIndex < 16; outputIndex++) {
        IntPtr output;
        hr = enumOutputs(adapter, outputIndex, out output);
        if (hr < 0 || output == IntPtr.Zero) break;
        IntPtr outputVtable = Marshal.ReadIntPtr(output);
        GetDesc getDesc = Marshal.GetDelegateForFunctionPointer<GetDesc>(Marshal.ReadIntPtr(outputVtable, 7 * IntPtr.Size));
        DXGI_OUTPUT_DESC desc = new DXGI_OUTPUT_DESC();
        hr = getDesc(output, ref desc);
        if (hr >= 0 && desc.AttachedToDesktop != 0) {
          RECT rect = desc.DesktopCoordinates;
          builder.Append(outputIndex).Append(' ').Append(rect.left).Append(' ').Append(rect.top).Append(' ')
            .Append(rect.right - rect.left).Append(' ').Append(rect.bottom - rect.top).Append('\\n');
          count++;
        }
        Release releaseOutput = Marshal.GetDelegateForFunctionPointer<Release>(Marshal.ReadIntPtr(outputVtable, 2 * IntPtr.Size));
        releaseOutput(output);
      }
      Release releaseAdapter = Marshal.GetDelegateForFunctionPointer<Release>(Marshal.ReadIntPtr(adapterVtable, 2 * IntPtr.Size));
      releaseAdapter(adapter);
      if (count > 0) break;
    }
    Release releaseFactory = Marshal.GetDelegateForFunctionPointer<Release>(Marshal.ReadIntPtr(vtable, 2 * IntPtr.Size));
    releaseFactory(factory);
    return builder.ToString();
  }
}
"@
[DxgiCaptureOutputs]::List()
`

const parseCaptureOutputs = (stdout: string) => {
  const outputs: CaptureOutput[] = []

  stdout.split(/\r?\n/).forEach((line) => {
    const parts = line.trim().split(' ')
    if (parts.length !== 5) return

    const numbers = parts.map((part) => Number(part))
    if (numbers.some((value) => !Number.isInteger(value))) return

    const [index, x, y, width, height] = numbers
    outputs.push({ index, x, y, width, height })
  })

  return outputs
}

export const listCaptureOutputs = async () => {
  const command = Buffer.from(listScript, 'utf16le').toString('base64')

  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-EncodedCommand', command],
      { windowsHide: true, timeout: 15000 }
    )

    return parseCaptureOutputs(stdout)
  } catch (error) {
    console.error(error)
    return []
  }
}
