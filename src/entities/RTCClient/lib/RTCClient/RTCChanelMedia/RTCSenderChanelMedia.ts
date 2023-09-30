import { useRoomRTCStore } from "@/entities/RTCClient/model/store/RoomRTCStore"
import { SettingMessage } from "./RTCChanelMedia"

const mimeType = `video/webm;codecs=vp8,opus`
const mimeTypeWithoutAudio = `video/webm;codecs=vp8`

export class RTCSenderChanelMedia {
  mediaRecorder: MediaRecorder | null = null
  private unsubfn
  private timer?: ReturnType<typeof setInterval>

  constructor(private readonly channel: RTCDataChannel) {
    this.channel.addEventListener("message", this.onNewMessage.bind(this))
    this.channel.addEventListener("close", () => this.unsubfn())
    this.unsubfn = this.initStoreSubscribe()
  }

  initStoreSubscribe() {
    let stream: MediaStream | null = null
    const sub = useRoomRTCStore.subscribe((state) => {
      const { displayMediaStream, experementalEncdoing } = state
      if (!displayMediaStream && stream !== displayMediaStream) {
        this.stopTransition()
      }
      stream = displayMediaStream
      if (!experementalEncdoing || !displayMediaStream) return

      const streamHasAudio = displayMediaStream.getAudioTracks()?.[0]
      if (streamHasAudio) this.startTransition(displayMediaStream, mimeType)
      else this.startTransition(displayMediaStream, mimeTypeWithoutAudio)
    })
    return sub
  }

  onNewMessage(e: MessageEvent) {
    switch (e.data) {
      case "close":
        break
      default:
        break
    }
  }

  startTransition = (stream: MediaStream, mimeType: string) => {
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 1024 * 1024 * 10,
    })
    this.channel.send(mimeType)
    this.mediaRecorder.ondataavailable = async (e) => {
      const buffer = await e.data.arrayBuffer()
      this.sendChunk(buffer)
    }
    this.mediaRecorder.start()
    clearInterval(this.timer)
    this.timer = setInterval(() => {
      this.mediaRecorder?.requestData()
    }, 300)
  }
  stopTransition() {
    clearInterval(this.timer ?? undefined)
    this.mediaRecorder?.stop()
    this.mediaRecorder = null
    this.sendSettings("close")
  }

  sendChunk(buffer: ArrayBuffer) {
    if (buffer.byteLength < this.channel.bufferedAmountLowThreshold) {
      this.channel.send(buffer)
    } else {
      const chunks = Math.ceil(
        buffer.byteLength / this.channel.bufferedAmountLowThreshold
      )
      for (let index = 0; index < chunks; index++) {
        const chunk = buffer.slice(
          this.channel.bufferedAmountLowThreshold * index,
          this.channel.bufferedAmountLowThreshold * (index + 1)
        )
        this.channel.send(chunk)
      }
    }
  }

  sendSettings(msg: SettingMessage) {
    this.channel.send(msg)
  }
}
