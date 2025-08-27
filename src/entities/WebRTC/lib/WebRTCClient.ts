import { socketClient } from 'src/shared/api'
import { Emitter } from 'src/shared/lib/utils'

import { useWebRTCStore } from '../model/WebRTCStore'
import type { StreamType } from '../types'
import { createBlackVideoTrack, createSilentAudioTrack, getIceServers, pauseSender, resumeSender } from '../utils'

type WebRTCClientConfig = { id: number }

type EventMessageToSocket = 'new_answer' | 'new_offer' | 'new_ice'

type EventMessageToPeer = 'stream_start' | 'stream_stop' | 'stream_status'

type WebRTCClientEvents = {
  onStreamStart: StreamType
  onStreamStop: StreamType
  onChatMessage: string
}

export class WebRTCClient extends Emitter<WebRTCClientEvents> {
  id: number
  private peer: RTCPeerConnection
  private channelInfo: RTCDataChannel
  private remoteSenderStreams: Record<StreamType, MediaStream | null> = {
    screen: null,
    webCam: null,
    mic: null,
  }
  private channelChat: RTCDataChannel

  remoteStreams: Partial<Record<StreamType, MediaStream | null>> = {}
  senders: {
    screenVideo: RTCRtpSender
    screenAudio: RTCRtpSender
    webCam: RTCRtpSender
    mic: RTCRtpSender
  }

  constructor(config: WebRTCClientConfig) {
    super()
    this.id = config.id
    this.peer = new RTCPeerConnection({
      iceServers: getIceServers(),
    })

    const { streams: storeStreams, bitrate: storeBitrate } = useWebRTCStore.getState()
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
    this.channelChat.onmessage = this.onChatMessage.bind(this)

    this.channelInfo = this.peer.createDataChannel('info', {
      id: 1,
      protocol: 'json',
      negotiated: true,
    })
    this.channelInfo.onmessage = this.onInfoMessage.bind(this)
    this.channelInfo.onopen = () => {
      this.setVideoBitrate(storeBitrate)
      if (storeStreams?.screen) {
        resumeSender(this.senders.screenVideo)
        resumeSender(this.senders.screenAudio)
        this.sendMessageToPeer('stream_start', 'screen')
      }
      if (storeStreams?.webCam) {
        resumeSender(this.senders.webCam)
        this.sendMessageToPeer('stream_start', 'webCam')
      }
      if (storeStreams?.mic) {
        resumeSender(this.senders.mic)
        this.sendMessageToPeer('stream_start', 'mic')
      }
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peer.createOffer()
    await this.peer.setLocalDescription(offer)
    this.sendMessageToSocket('new_offer', { offer })
    return offer
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    const answer = await this.peer.createAnswer()
    await this.peer.setLocalDescription(answer)
    this.sendMessageToSocket('new_answer', { answer })
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
    this.sendMessageToPeer('stream_start', type)
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
    this.sendMessageToPeer('stream_stop', type)
  }

  private sendMessageToSocket(event: EventMessageToSocket, message: Record<string, unknown>) {
    const resp = {
      id: this.id,
      ...message,
    }
    socketClient.emit(event, resp)
  }

  private onIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      this.sendMessageToSocket('new_ice', { ice: event.candidate })
    }
  }

  setVideoBitrate(bitrate: number) {
    const screenVideoParams = { ...this.senders.screenVideo.getParameters() }
    const webCamParams = { ...this.senders.webCam.getParameters() }
    screenVideoParams.encodings = screenVideoParams.encodings.map((encoding) => ({ ...encoding, maxBitrate: bitrate }))
    webCamParams.encodings = webCamParams.encodings.map((encoding) => ({ ...encoding, maxBitrate: bitrate }))
    this.senders.screenVideo.setParameters(screenVideoParams)
    this.senders.webCam.setParameters(webCamParams)
  }

  private onTrack(event: RTCTrackEvent) {
    const [stream] = event.streams
    const tracks = stream?.getTracks() || []

    if (tracks.length === 0) return
    else if (tracks.length === 2) this.remoteSenderStreams.screen = stream
    else if (tracks[0].kind === 'video') this.remoteSenderStreams.webCam = stream
    else if (tracks[0].kind === 'audio') this.remoteSenderStreams.mic = stream
  }

  private sendMessageToPeer(event: EventMessageToPeer, message: unknown) {
    try {
      this.channelInfo.send(JSON.stringify({ event, message }))
    } catch (error) {
      console.log('error', error)
    }
  }

  private onInfoMessage(event: MessageEvent) {
    const data = JSON.parse(event.data)

    switch (data.event) {
      case 'stream_start':
        this.remoteStreams[data.message as StreamType] = this.remoteSenderStreams[data.message as StreamType]
        this.emit('onStreamStart', data.message as StreamType)
        break
      case 'stream_stop':
        this.remoteStreams[data.message as StreamType] = undefined
        this.emit('onStreamStop', data.message as StreamType)
        break
    }
    console.log('onInfoMessage', data)
  }

  sendMessageToChat(message: string) {
    try {
      this.channelChat.send(JSON.stringify({ message, type: 'text' }))
    } catch (error) {
      console.log('error', error)
    }
  }

  sendFileToChat(blob: Blob, name?: string) {
    console.log('not implemented', blob, name)
    // this.channelChat.send(JSON.stringify({ type: 'file', blob, name }))
  }

  private onChatMessage(event: MessageEvent) {
    const { message, type } = JSON.parse(event.data)

    if (type === 'text') {
      return this.emit('onChatMessage', message)
    }

    return console.log('unknown message', message)
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

