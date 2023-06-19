import Emitter from "@/shared/lib/utils/Emitter/Emitter"
import { MediaStreamTypes } from "../../model/types/RoomRTCSchema"

type events = "close" | "open"

export class RTCClientMediaStream extends Emitter<events> {
  id: string
  stream: MediaStream
  type: MediaStreamTypes
  allowControl?: boolean
  volume = 0
  isOpen: boolean

  hasvideo: boolean
  hasaudio: boolean

  constructor(mediastream: MediaStream, type: MediaStreamTypes) {
    super()
    this.stream = mediastream
    this.type = type

    this.hasvideo = !!this.stream.getVideoTracks().length
    this.hasaudio = !!this.stream.getAudioTracks().length
    this.id = this.stream.getTracks()?.[0]?.id || new Date().toString()

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

  setAllowcontrol(value: boolean) {
    this.allowControl = value
  }

  addTrack(track: MediaStreamTrack) {
    if (track.kind === "audio") this.hasaudio = true
    else if (track.kind === "video") this.hasvideo = true
    this.stream.addTrack(track)
  }
}
