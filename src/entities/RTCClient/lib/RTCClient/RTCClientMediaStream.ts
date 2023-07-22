import Emitter from "@/shared/lib/utils/Emitter/Emitter"
import { MediaStreamTypes } from "../../model/types/RoomRTCSchema"

type events = { close: void; open: void }

export class RTCClientMediaStream extends Emitter<events> {
  id: string
  stream: MediaStream
  type: MediaStreamTypes
  allowControl?: boolean
  volume = 0
  isOpen: boolean
  isMute: boolean

  hasvideo: boolean
  hasaudio: boolean

  constructor(mediastream: MediaStream, type: MediaStreamTypes) {
    super()
    this.stream = mediastream
    this.type = type
    if (type === "microphone") this.volume = 1

    this.hasvideo = !!this.stream.getVideoTracks().length
    this.hasaudio = !!this.stream.getAudioTracks().length
    this.id = this.stream.getTracks()?.[0]?.id || new Date().toString()
    this.isMute = false

    this.isOpen = true
  }

  close() {
    this.isOpen = false
    this.emit("close", undefined)
  }

  open() {
    this.isOpen = true
    this.emit("open", undefined)
  }

  setAllowcontrol(value: boolean) {
    this.allowControl = value
  }

  addTrack(track: MediaStreamTrack) {
    if (track.kind === "audio") this.hasaudio = true
    else if (track.kind === "video") this.hasvideo = true
    this.stream.addTrack(track)
  }

  mute() {
    this.isMute = true
  }
  unMute() {
    this.isMute = false
  }
}
