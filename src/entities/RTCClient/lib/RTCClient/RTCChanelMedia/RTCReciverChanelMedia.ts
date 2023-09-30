import { SettingMessage } from "./RTCChanelMedia"

export class RTCReciverChanelMedia {
  sourceBuffer: SourceBuffer | null = null
  mediaSource: MediaSource | null = null
  queue: ArrayBuffer[] = []

  constructor(private readonly channel: RTCDataChannel) {
    this.channel.addEventListener("message", this.onNewMessage.bind(this))
  }

  onNewMessage(e: MessageEvent) {
    const { data } = e
    if (typeof data === "string") {
      this.reciveSettings(data as SettingMessage)
    }
    if (typeof data === "object") {
      this.reciveChunk(data)
    }
  }
  reciveSettings(msg: SettingMessage) {
    if (msg.startsWith("video/")) {
      return this.startStream(msg)
    }
    switch (msg) {
      case "close":
        this.closeStream()
        break
      default:
        break
    }
  }
  startStream(mimeType: string) {
    this.mediaSource = new MediaSource()
    this.mediaSource.onsourceopen = () => {
      this.sourceBuffer = this.mediaSource!.addSourceBuffer(mimeType)
      this.sourceBuffer.onupdate = () => {
        if (this.queue.length > 0 && !this.sourceBuffer?.updating) {
          this.sourceBuffer?.appendBuffer(this.queue.shift()!)
        }
      }
    }
    const video = document.createElement("video")
    video.src = window.URL.createObjectURL(this.mediaSource)
    video.style.position = "absolute"
    video.style.top = "12em"
    video.style.left = "4em"
    video.style.width = "800px"
    video.style.aspectRatio = "16/9"
    video.controls = true
    video.autoplay = true
    document.body.appendChild(video)
  }
  closeStream() {
    console.log("stream end")
    if (this.sourceBuffer?.updating) this.sourceBuffer?.abort()
    this.mediaSource?.endOfStream()
    this.mediaSource = null
    this.sourceBuffer = null
  }
  reciveChunk(buffer: ArrayBuffer) {
    if (this.sourceBuffer?.updating === false && this.queue.length > 0) {
      this.queue.push(buffer)
      return this.sourceBuffer?.appendBuffer(this.queue.shift()!)
    }

    if (
      !this.sourceBuffer ||
      this.sourceBuffer.updating ||
      this.queue.length > 0
    ) {
      this.queue.push(buffer)
    } else {
      this.sourceBuffer?.appendBuffer(buffer)
    }
  }
  play() {}
  pause() {}
}
