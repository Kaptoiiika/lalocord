import Emitter from "@/shared/lib/utils/Emitter/Emitter"

type events = "close" | "open"

export class RTCClientMediaStream extends Emitter<events> {
  stream: MediaStream
  volume = 0
  closed: boolean

  constructor(mediastream: MediaStream) {
    super()
    this.stream = mediastream
    this.closed = false
    this.open()
  }

  close() {
    this.closed = true
    this.emit("close")
  }

  open() {
    this.closed = false
    this.emit("open")
  }
}
