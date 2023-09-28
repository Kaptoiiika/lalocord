import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { IRTCReciverChanelMedia } from "./types/RTCChanelMedia"

const mimeType = `video/webm;codecs=vp8,opus`

export class RTCChanelMedia implements IRTCReciverChanelMedia {
  isOpen = false
  isReady = false
  sourceBuffer: SourceBuffer | null = null
  mediaRecorder: MediaRecorder | null = null
  queue: ArrayBuffer[] = []
  channel
  mediaSource
  unsub: () => void

  constructor(private readonly peer: RTCPeerConnection, label = "media") {
    this.mediaSource = new MediaSource()
    this.mediaSource.onsourceopen = () => {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType)
      this.sourceBuffer.onupdate = () => {
        if (this.queue.length > 0 && !this.sourceBuffer?.updating) {
          this.sourceBuffer?.appendBuffer(this.queue.shift()!)
        }
      }
    }
    const video = document.createElement("video")
    video.src = window.URL.createObjectURL(this.mediaSource)
    video.style.position = "absolute"
    video.style.width = "200px"
    video.style.aspectRatio = "16/9"
    video.controls = true
    document.body.appendChild(video)
    this.isReady = true

    this.channel = this.peer.createDataChannel(label)
    this.channel.binaryType = "arraybuffer"
    this.channel.onopen = () => {
      this.isOpen = true
      if (this.peer.sctp?.maxMessageSize) {
        this.channel.bufferedAmountLowThreshold = this.peer.sctp.maxMessageSize
      }
    }
    this.channel.onclose = () => {
      this.isOpen = false
    }
    const datachannelfunction = (e: RTCDataChannelEvent) => {
      if (e.channel.label === label) {
        const fn = (e: MessageEvent) => {
          this.onNewMessage(e.data)
        }

        e.channel.onmessage = fn.bind(this)
        this.peer.removeEventListener("datachannel", datachannelfunction)
      }
    }
    this.peer.addEventListener("datachannel", datachannelfunction)

    this.unsub = useRoomRTCStore.subscribe((state) => {
      const { displayMediaStream } = state
      if (displayMediaStream) {
        this.startTransition(displayMediaStream)
      }
    })
  }

  play = () => {}
  pause = () => {}
  startTransition = (stream: MediaStream) => {
    this.unsub()
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 1024 * 1024,
    })
    this.mediaRecorder.ondataavailable = async (e) => {
      const buffer = await e.data.arrayBuffer()
      this.sendChunk(buffer)
    }
    this.mediaRecorder.start(100)
  }
  sendChunk = (buffer: ArrayBuffer) => {
    if (buffer.byteLength < this.channel.bufferedAmountLowThreshold) {
      this.channel.send(buffer)
      console.log("send full", buffer)
    } else {
      console.log("send chunk", buffer)

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
  onNewMessage = (data: string | ArrayBuffer) => {
    if (typeof data !== "object") return
    if (!this.isReady) {

    }

    console.log("recive data", data)


    if (this.sourceBuffer?.updating || this.queue.length > 0) {
      this.queue.push(data)
    } else {
      this.sourceBuffer?.appendBuffer(data)
    }
  }
}
