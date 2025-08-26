import { socketClient } from 'src/shared/api'

import { useWebRTCStore } from '../model/WebRTCStore'
import type { StreamType } from '../types'
import { createBlackVideoTrack, createSilentAudioTrack, getIceServers, pauseSender, resumeSender } from '../utils'

type WebRTCClientConfig = { id: number }

type EventMessageToPeer = 'new_answer' | 'new_offer' | 'new_ice'


export class WebRTCClient {
  id: number
  private peer: RTCPeerConnection
  private channelInfo: RTCDataChannel
  channelChat: RTCDataChannel
  remoteStreams: Record<StreamType, MediaStream | null> = {
    screen: null,
    webCam: null,
    mic: null,
  }
  senders: {
    screenVideo: RTCRtpSender
    screenAudio: RTCRtpSender
    webCam: RTCRtpSender
    mic: RTCRtpSender
  }

  constructor(config: WebRTCClientConfig) {
    this.id = config.id
    this.peer = new RTCPeerConnection({
      iceServers: getIceServers(),
    })

    const storeStreams = useWebRTCStore.getState().streams
    const screenVideoTrack = storeStreams?.screen?.getVideoTracks()[0] ?? createBlackVideoTrack()
    const screenAudioTrack = storeStreams?.screen?.getAudioTracks()[0] ?? createSilentAudioTrack()
    const webCamVideoTrack = storeStreams?.webCam?.getVideoTracks()[0] ?? createBlackVideoTrack()
    const micAudioTrack = storeStreams?.mic?.getAudioTracks()[0] ?? createSilentAudioTrack()

    const screenStream = storeStreams?.screen ?? new MediaStream([screenVideoTrack, screenAudioTrack])
    const webCamStream = storeStreams?.webCam ?? new MediaStream([webCamVideoTrack])
    const micStream = storeStreams?.mic ?? new MediaStream([micAudioTrack])
    this.senders = {
      screenVideo: this.peer.addTrack(screenVideoTrack, screenStream),
      screenAudio: this.peer.addTrack(screenAudioTrack, screenStream),
      webCam: this.peer.addTrack(webCamVideoTrack, webCamStream),
      mic: this.peer.addTrack(micAudioTrack, micStream),
    }
    if (!storeStreams?.screen) {
      pauseSender(this.senders.screenVideo)
      pauseSender(this.senders.screenAudio)
    }
    if (!storeStreams?.webCam) {
      pauseSender(this.senders.webCam)
    }
    if (!storeStreams?.mic) {
      pauseSender(this.senders.mic)
    }

    this.peer.onicecandidate = this.onIceCandidate.bind(this)
    this.peer.ontrack = this.onTrack.bind(this)

    this.channelChat = this.peer.createDataChannel('chat', {
      id: 0,
      protocol: 'json',
      negotiated: true,
    })

    this.channelInfo = this.peer.createDataChannel('info', {
      id: 1,
      protocol: 'json',
      negotiated: true,
    })
    this.channelInfo.onmessage = this.onInfoMessage.bind(this)
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peer.createOffer()
    await this.peer.setLocalDescription(offer)
    this.sendMessageToPeer('new_offer', { offer })
    return offer
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.peer.createAnswer()
    await this.peer.setLocalDescription(answer)
    this.sendMessageToPeer('new_answer', { answer })
    return answer
  }

  async setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    await this.peer.setRemoteDescription(new RTCSessionDescription(desc))
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    await this.peer.addIceCandidate(new RTCIceCandidate(candidate))
  }

  sendStream(stream: MediaStream, type: StreamType) {
    const [videoTrack] = stream.getVideoTracks()
    const [audioTrack] = stream.getAudioTracks()
    if (type === 'screen') {
      this.senders.screenVideo.replaceTrack(videoTrack)
      this.senders.screenAudio.replaceTrack(audioTrack ?? null)
      resumeSender(this.senders.screenVideo)
      resumeSender(this.senders.screenAudio)
    } else if (type === 'webCam') {
      this.senders.webCam.replaceTrack(videoTrack)
      resumeSender(this.senders.webCam)
    } else if (type === 'mic') {
      this.senders.mic.replaceTrack(audioTrack)
      resumeSender(this.senders.mic)
    }
  }

  stopStream(type: StreamType) {
    if (type === 'screen') {
      this.senders.screenVideo.replaceTrack(null)
      this.senders.screenAudio.replaceTrack(null)
      pauseSender(this.senders.screenVideo)
      pauseSender(this.senders.screenAudio)
    } else if (type === 'webCam') {
      this.senders.webCam.replaceTrack(null)
      pauseSender(this.senders.webCam)
    } else if (type === 'mic') {
      this.senders.mic.replaceTrack(null)
      pauseSender(this.senders.mic)
    }
  }

  private sendMessageToPeer(event: EventMessageToPeer, message: Record<string, unknown>) {
    const resp = {
      id: this.id,
      ...message,
    }
    socketClient.emit(event, resp)
  }

  private onIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      this.sendMessageToPeer('new_ice', { ice: event.candidate })
    }
  }

  private onTrack(event: RTCTrackEvent) {
    const [stream] = event.streams
    const tracks = stream?.getTracks() || []

    if (tracks.length === 0) return
    else if (tracks.length === 2) this.remoteStreams.screen = stream
    else if (tracks[0].kind === 'video') this.remoteStreams.webCam = stream
    else if (tracks[0].kind === 'audio') this.remoteStreams.mic = stream
  }

  private onInfoMessage(event: MessageEvent) {
    console.log('onInfoMessage', event)
  }

  get connectionState(): RTCPeerConnectionState {
    return this.peer.connectionState
  }

  getPeer(): RTCPeerConnection {
    return this.peer
  }

  close() {
    this.peer.close()
  }
}

