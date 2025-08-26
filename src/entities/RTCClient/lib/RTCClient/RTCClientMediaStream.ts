import type { StreamType } from 'src/entities/WebRTC'

export class RTCClientMediaStream {
  id: string
  stream: MediaStream
  type: StreamType
  allowControl?: boolean
  volume = 0
  isOpen: boolean
  isMute: boolean

  hasvideo: boolean
  hasaudio: boolean

  constructor(mediastream: MediaStream, type: StreamType) {
    this.stream = mediastream
    this.type = type
    if (type === 'mic') this.volume = 1

    this.hasvideo = !!this.stream.getVideoTracks().length
    this.hasaudio = !!this.stream.getAudioTracks().length
    this.id = this.stream.id || new Date().toString()
    this.isMute = false

    this.isOpen = true
  }

  close() {
    this.isOpen = false
  }

  open() {
    this.isOpen = true
  }

  setAllowcontrol(value: boolean) {
    this.allowControl = value
  }

  addTrack(track: MediaStreamTrack) {
    if (track.kind === 'audio') this.hasaudio = true
    else if (track.kind === 'video') this.hasvideo = true
    this.stream.addTrack(track)
  }

  mute() {
    this.isMute = true
  }

  unMute() {
    this.isMute = false
  }
}
