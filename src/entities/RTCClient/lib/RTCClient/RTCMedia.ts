import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { logger } from 'src/shared/lib/logger/Logger'
import { Emitter } from 'src/shared/lib/utils'
import { isDefined } from 'src/shared/lib/utils/Arrays'

import type { RTCClientMediaStream } from './RTCClientMediaStream'
import type { MediaStreamTypes } from 'src/shared/types'
import type { ClientKeyPressEvent, ClientMouseEvent } from 'src/shared/types/ClientEvents'

export type RTCMediaStreamEvents = {
  newstream: RTCClientMediaStream | null
  stopStream: MediaStreamTypes
  sendStream: void
  needUpdateStreamType: void
}

export type RemoteTracksTypes = {
  type: MediaStreamTypes
  kind: string
  mid: string | null
  allowControl?: boolean
}

export class RTCMedia extends Emitter<RTCMediaStreamEvents> {
  peer: RTCPeerConnection | null
  availableStreamList: RTCClientMediaStream[] = []
  remoteStream: Record<string, RTCClientMediaStream | undefined> = {}
  remoteTrack: Record<string, MediaStreamTrack> = {}
  allowControl = false

  stream: Record<MediaStreamTypes, MediaStream | null> = {
    media: null,
    webCam: null,
    microphone: null,
  }

  senders: Record<MediaStreamTypes, RTCRtpSender[] | null> = {
    media: null,
    webCam: null,
    microphone: null,
  }

  encodingSettings: RTCRtpEncodingParameters = {}
  pause: Record<MediaStreamTypes, boolean> = {
    media: true,
    webCam: true,
    microphone: true,
  }

  constructor(peer: RTCPeerConnection) {
    super()
    this.peer = peer
    this.peer.ontrack = this.reciveTrack.bind(this)
  }

  reqestPauseStream(type: MediaStreamTypes) {
    this.pause[type] = true
    this.updateBitrate(type)
  }

  reqestResumeStream(type: MediaStreamTypes) {
    this.pause[type] = false
    this.updateBitrate(type)
  }

  async sendStream(stream: MediaStream, type: MediaStreamTypes) {
    if (!this.peer) return
    const [videoStream] = stream.getVideoTracks()
    const [audioStream] = stream.getAudioTracks()
    const currentSenders = this.senders[type]

    const senderVideo = currentSenders?.find((s) => s.track?.kind === videoStream?.kind)
    const senderAudio = currentSenders?.find((s) => s.track?.kind === audioStream?.kind)

    const senders = stream.getTracks().map(async (track) => {
      if (senderVideo && track.kind === 'video') {
        await senderVideo.replaceTrack(track).catch((err) => {
          logger(err)
        })

        return senderVideo
      }
      if (senderAudio && track.kind === 'audio') {
        await senderAudio.replaceTrack(track).catch((err) => {
          logger(err)
        })

        return senderAudio
      }

      return this.peer?.addTrack(track, stream) // this.peer checked from the top
    })

    this.senders[type] = (await Promise.all(senders)).filter(isDefined)
    this.emit('sendStream', undefined)
  }

  getStreamType(): RemoteTracksTypes[] {
    const allTrans = this.peer?.getTransceivers()
    const availableStream: RemoteTracksTypes[] = []

    Object.entries(this.stream).forEach(([key, value]) => {
      value?.getTracks().forEach((track) => {
        const transceiver = allTrans?.find((trans) => trans.sender.track === track)

        availableStream.push({
          type: key as MediaStreamTypes,
          kind: track.kind,
          mid: transceiver?.mid || null,
          allowControl: key === 'media' ? this.allowControl : undefined,
        })
      })
    })

    return availableStream
  }

  setAllowControl(value: boolean) {
    this.allowControl = value
    this.emit('sendStream', undefined)
  }

  reciveTrack(event: RTCTrackEvent) {
    const track = event.track

    this.remoteTrack[track.id] = track

    this.emit('needUpdateStreamType', undefined)
    logger('reciveTrack', track)
  }

  updateStreamType(tracksType: RemoteTracksTypes[]) {
    const transceivers = this.peer?.getTransceivers()

    tracksType.forEach((trackType) => {
      const currentTrans = transceivers?.find((trans) => trans.mid === trackType.mid)

      if (!currentTrans) return
      const currentStream = this.remoteStream[trackType.type]
      const currentTrack = currentTrans.receiver.track

      if (currentStream) {
        if (currentTrack) currentStream.addTrack(currentTrack)
        if (trackType.allowControl) currentStream.setAllowcontrol(trackType.allowControl)
        currentStream.open()

        return
      }

      const mediaStream = new MediaStream()

      if (currentTrack) mediaStream.addTrack(currentTrack)
    })
  }

  stopStream(type: MediaStreamTypes) {
    this.stream[type] = null
    this.emit('stopStream', type)
  }

  remoteClosedStream(type: MediaStreamTypes) {
    this.remoteStream[type]?.close()
  }

  updateBitrate(type: MediaStreamTypes) {
    if (!this.peer) return
    const videoSender = this.senders[type]

    if (!videoSender) return
    videoSender?.map((sender) => {
      if (sender.track?.kind !== 'video') {
        return
      }

      const params = sender.getParameters()
      const encoders = params.encodings.map<RTCRtpEncodingParameters>((encod) => {
        if (this.pause[type]) {
          return {
            ...encod,
            ...this.encodingSettings,
            active: false,
          }
        }

        return {
          ...encod,
          ...this.encodingSettings,
          active: true,
        }
      })

      params.encodings = encoders
      sender.setParameters(params)
    })
  }

  clientPressKey(key: ClientKeyPressEvent) {
    if (!__IS_ELECTRON__) return
    if (!this.allowControl) return
    console.log(`window.electron.ipcRenderer.sendMessage('keypress', ${key});`)
    // window.electron.ipcRenderer.sendMessage('keypress', key);
  }

  clientMouseChange(payload: ClientMouseEvent) {
    if (!__IS_ELECTRON__) return
    if (!this.allowControl) return
    console.log(`window.electron.ipcRenderer.sendMessage('mousemove', ${payload});`)
    // window.electron.ipcRenderer.sendMessage('mousemove', payload);
  }

  close() {
    const senders = [...(this.senders.media || []), ...(this.senders.webCam || []), ...(this.senders.microphone || [])]

    senders.forEach((sender) => {
      sender.replaceTrack(null)
    })
  }
}
