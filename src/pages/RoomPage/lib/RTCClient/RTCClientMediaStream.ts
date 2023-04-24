import Emitter from "@/shared/lib/utils/Emitter/Emitter"
import { MediaStreamTypes } from "../../model/types/RoomRTCSchema"

type events = "close" | "open"

export class RTCClientMediaStream extends Emitter<events> {
  stream: MediaStream
  type: MediaStreamTypes
  volume = 0
  isOpen: boolean

  hasvideo: boolean
  hasaudio: boolean

  constructor(mediastream: MediaStream, type:MediaStreamTypes) {
    super()
    this.stream = mediastream
    this.type = type

    this.hasvideo = !!this.stream.getVideoTracks().length
    this.hasaudio = !!this.stream.getAudioTracks().length

    this.isOpen = true
  }

  close() {
    this.isOpen = false
    this.emit("close")
  }

  open() {
    this.isOpen = true
    this.emit("open")
  }

  addTrack(track: MediaStreamTrack) {
    if (track.kind === "audio") this.hasaudio = true
    else if (track.kind === "video") this.hasvideo = true
    this.stream.addTrack(track)
  }
}
