import { socketClient } from 'src/shared/api'
import { logger } from 'src/shared/lib/logger/Logger'
import { Emitter } from 'src/shared/lib/utils'
import { isRemoteControlEvent } from 'src/shared/types/ClientEvents'

import type { GameType } from 'src/entities/Game'
import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'

import { useWebRTCStore } from '../model/WebRTCStore'
import { MessageCodec } from './Codec/MessageCodec'
import { DataChannel } from './DataChannel'
import type { StreamType } from '../types'
import {
  changeVideoCodecs,
  createBlackVideoTrack,
  createSilentAudioTrack,
  getIceServers,
  pauseSender,
  resumeSender,
} from '../utils'

type WebRTCClientConfig = { id: string; isInitiator: boolean }

type PendingIceCandidate = {
  ice: RTCIceCandidateInit
  connectionId?: string
}

type EventMessageToSocket = 'new_answer' | 'new_offer' | 'new_ice'

type EventMessageToPeer =
  | 'stream_start'
  | 'stream_stop'
  | 'stream_status'
  | 'stream_track_pause'
  | 'stream_track_resume'
  | 'remote_control_status'

type FileHeader = {
  id: Uint8Array
  length: number
  type?: string
  name?: string
}
type ChunkFileHeader = Omit<FileHeader, 'id'>

export type WebRTCChatMessage = {
  id: string
  message?: string
  blob?: Blob
  blobParams?: {
    length: number
    loaded: number
    type?: string
    name?: string
  }
  isSystemMessage?: boolean
}

export type WebRTCTransmissionMessage = Pick<WebRTCChatMessage, 'id' | 'isSystemMessage' | 'blobParams'> & {
  transmission: {
    length: number
    loaded: number
    isSender: boolean
  }
}

export type WebRTCMiniGameMessage = {
  message?: string
  action: 'request' | 'accept' | 'decline' | 'waiting'
  gameId: string
  gameType: GameType
}

type WebRTCClientEvents = {
  onStreamStart: StreamType
  onStreamStop: StreamType
  onStreamTrackPause: StreamType
  onStreamTrackResume: StreamType
  onChatMessage: string
  onChatMessageFile: WebRTCChatMessage
  onChatMessageLoadFile: WebRTCTransmissionMessage
  onMiniGameMessage: unknown
  onMiniGameRequsest: WebRTCMiniGameMessage
  onRemoteControlStatus: boolean
  onControlEvent: RemoteControlEvent
}

export class WebRTCClient extends Emitter<WebRTCClientEvents> {
  id: string
  readonly isInitiator: boolean
  connectionId?: string
  private peer: RTCPeerConnection
  private codec: MessageCodec
  private chatFileTempData: Map<string, Uint8Array> = new Map()
  private remoteSenderStreams: Record<StreamType, MediaStream>
  private pendingCandidates: PendingIceCandidate[] = []
  private signalingQueue: Promise<void> = Promise.resolve()
  private isClosed = false
  private isNewOfferRequested = false
  private channelChat: DataChannel
  private channelFile: DataChannel
  channelInfo: DataChannel
  channelMiniGame: DataChannel
  private channelControl: DataChannel
  private isRemoteControlEnabled = false

  remoteStreams: Partial<Record<StreamType, MediaStream | null>> = {}
  remoteControlAvailable = false
  senders: {
    screenVideo: RTCRtpSender
    screenAudio: RTCRtpSender
    webCam: RTCRtpSender
    mic: RTCRtpSender
  }

  constructor(config: WebRTCClientConfig) {
    super()
    this.id = config.id
    this.isInitiator = config.isInitiator
    if (config.isInitiator) {
      this.connectionId = crypto.randomUUID()
    }
    this.peer = new RTCPeerConnection({
      iceServers: getIceServers(),
    })

    const { streams: storeStreams } = useWebRTCStore.getState()
    const screenVideoPlaceholder = createBlackVideoTrack()
    const webCamVideoPlaceholder = createBlackVideoTrack()
    const screenAudioPlaceholder = createSilentAudioTrack()
    const micAudioPlaceholder = createSilentAudioTrack()
    const screenPlaceholderStream = new MediaStream([screenVideoPlaceholder, screenAudioPlaceholder.track])
    const webCamPlaceholderStream = new MediaStream([webCamVideoPlaceholder])
    const micPlaceholderStream = new MediaStream([micAudioPlaceholder.track])

    // addTrack в фиксированном порядке: screen video, screen audio, webcam, mic.
    // На отвечающей стороне эти transceiver сопоставляются со строками m= из offer.
    // Заглушки нужны только чтобы создать transceiver и сразу заменяются реальной дорожкой или null.
    this.senders = {
      screenVideo: this.peer.addTrack(screenVideoPlaceholder, screenPlaceholderStream),
      screenAudio: this.peer.addTrack(screenAudioPlaceholder.track, screenPlaceholderStream),
      webCam: this.peer.addTrack(webCamVideoPlaceholder, webCamPlaceholderStream),
      mic: this.peer.addTrack(micAudioPlaceholder.track, micPlaceholderStream),
    }
    this.remoteSenderStreams = this.createRemoteSenderStreams()

    const releasePlaceholders = () => {
      screenVideoPlaceholder.stop()
      webCamVideoPlaceholder.stop()
      screenAudioPlaceholder.close()
      micAudioPlaceholder.close()
    }

    void Promise.all([
      this.senders.screenVideo.replaceTrack(storeStreams.screen?.getVideoTracks()[0] ?? null),
      this.senders.screenAudio.replaceTrack(storeStreams.screen?.getAudioTracks()[0] ?? null),
      this.senders.webCam.replaceTrack(storeStreams.webCam?.getVideoTracks()[0] ?? null),
      this.senders.mic.replaceTrack(storeStreams.mic?.getAudioTracks()[0] ?? null),
    ])
      .catch((error) => {
        console.error(error)
      })
      .finally(releasePlaceholders)

    this.peer.onicecandidate = this.onIceCandidate.bind(this)
    this.peer.onconnectionstatechange = this.onConnectionStateChange.bind(this)
    this.channelChat = new DataChannel(this.peer, 'chat', {
      id: 0,
      protocol: 'json',
      negotiated: true,
    })
    this.channelChat.onMessage = this.onChatMessage.bind(this)

    this.channelFile = new DataChannel(this.peer, 'file', {
      id: 1,
      protocol: 'arrayBuffer',
      negotiated: true,
    })

    this.codec = new MessageCodec({
      headerName: 'lalohead',
      maxChunkSize: 250000,
    })
    this.channelFile.channel.binaryType = 'arraybuffer'
    this.channelFile.channel.bufferedAmountLowThreshold = 1024 * 64 - 1
    this.channelFile.onOpen = () => {
      if (this.peer.sctp?.maxMessageSize) {
        this.channelFile.channel.bufferedAmountLowThreshold = this.peer.sctp.maxMessageSize
      }
    }
    this.channelFile.onMessage = this.onFileMessage.bind(this)

    this.channelInfo = new DataChannel(this.peer, 'info', {
      id: 2,
      protocol: 'json',
      negotiated: true,
    })
    this.channelInfo.onMessage = this.onInfoMessage.bind(this)
    this.channelInfo.onOpen = () => {
      const { streams, bitrate } = useWebRTCStore.getState()

      this.setVideoBitrate(bitrate)
      if (streams.screen) {
        resumeSender(this.senders.screenVideo)
        resumeSender(this.senders.screenAudio)
        this.sendMessageToPeer('stream_start', 'screen')
      }
      if (streams.webCam) {
        resumeSender(this.senders.webCam)
        this.sendMessageToPeer('stream_start', 'webCam')
      }
      if (streams.mic) {
        resumeSender(this.senders.mic)
        this.sendMessageToPeer('stream_start', 'mic')
      }
      this.sendMessageToPeer('remote_control_status', { enabled: this.isRemoteControlEnabled })
    }
    this.channelMiniGame = new DataChannel(this.peer, 'miniGame', {
      id: 3,
      protocol: 'json',
      negotiated: true,
    })
    this.channelMiniGame.onMessage = this.onMiniGameMessage.bind(this)
    this.channelControl = new DataChannel(this.peer, 'control', {
      id: 4,
      protocol: 'json',
      negotiated: true,
    })
    this.channelControl.onMessage = this.onControlMessage.bind(this)
  }

  createOffer(options?: { isIceRestart?: boolean }): Promise<void> {
    return this.enqueueSignaling(async () => {
      // Пока answer не применён, второй offer оставляет signaling в have-local-offer и срывает рукопожатие.
      if (this.peer.signalingState === 'have-local-offer') return

      this.peer.getTransceivers().forEach((transceiver) => {
        changeVideoCodecs(transceiver, 'H264')
      })

      const offer = await this.peer.createOffer({
        iceRestart: Boolean(options?.isIceRestart),
      })
      await this.peer.setLocalDescription(offer)
      if (this.isClosed) return
      this.sendMessageToSocket('new_offer', { offer })
    })
  }

  handleOffer(offer: RTCSessionDescriptionInit, connectionId?: string): Promise<void> {
    return this.enqueueSignaling(async () => {
      if (connectionId && this.connectionId && connectionId !== this.connectionId) return
      if (connectionId && !this.connectionId) {
        this.connectionId = connectionId
      }

      try {
        if (this.peer.signalingState === 'have-local-offer') {
          if (this.isInitiator) return
          await this.peer.setLocalDescription({ type: 'rollback' })
        }

        await this.peer.setRemoteDescription(new RTCSessionDescription(offer))
        await this.flushPendingCandidates()
        const answer = await this.peer.createAnswer()
        await this.peer.setLocalDescription(answer)
        if (this.isClosed) return
        this.sendMessageToSocket('new_answer', { answer })
      } catch (error) {
        console.error('handleOffer error', error)
        if (this.isClosed || this.isNewOfferRequested) return
        this.isNewOfferRequested = true
        socketClient.emit('request_new_offer', { id: this.id })
      }
    })
  }

  handleAnswer(answer: RTCSessionDescriptionInit, connectionId?: string): Promise<void> {
    return this.enqueueSignaling(async () => {
      if (this.peer.signalingState !== 'have-local-offer') return
      // Старый сервер не прокидывает connectionId. Такой ответ всё равно относится к единственному локальному offer.
      if (connectionId && this.connectionId && connectionId !== this.connectionId) return

      await this.peer.setRemoteDescription(new RTCSessionDescription(answer))
      await this.flushPendingCandidates()
    })
  }

  handleIce(ice: RTCIceCandidateInit, connectionId?: string): Promise<void> {
    return this.enqueueSignaling(async () => {
      if (connectionId && this.connectionId && connectionId !== this.connectionId) return
      if (!this.peer.remoteDescription) {
        this.pendingCandidates.push({ ice, connectionId })
        return
      }

      await this.addIceCandidate(ice)
    })
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

  private enqueueSignaling(task: () => Promise<void>): Promise<void> {
    const run = this.signalingQueue
      .then(async () => {
        if (this.isClosed) return
        await task()
      })
      .catch((error) => {
        console.error('signaling error', error)
      })

    this.signalingQueue = run
    return run
  }

  private async flushPendingCandidates() {
    const pendingCandidates = this.pendingCandidates.splice(0)

    for (const pendingCandidate of pendingCandidates) {
      if (pendingCandidate.connectionId && this.connectionId && pendingCandidate.connectionId !== this.connectionId) {
        continue
      }

      await this.addIceCandidate(pendingCandidate.ice)
    }
  }

  private async addIceCandidate(ice: RTCIceCandidateInit) {
    try {
      await this.peer.addIceCandidate(new RTCIceCandidate(ice))
    } catch (error) {
      console.error('addIceCandidate error', error)
    }
  }

  private getSenderTransceiver(sender: RTCRtpSender) {
    const transceiver = this.peer.getTransceivers().find((item) => item.sender === sender)
    if (!transceiver) {
      throw new Error('Transceiver for sender was not created')
    }

    return transceiver
  }

  private createRemoteSenderStreams(): Record<StreamType, MediaStream> {
    const screenVideoTrack = this.getSenderTransceiver(this.senders.screenVideo).receiver.track
    const screenAudioTrack = this.getSenderTransceiver(this.senders.screenAudio).receiver.track
    const webCamTrack = this.getSenderTransceiver(this.senders.webCam).receiver.track
    const micTrack = this.getSenderTransceiver(this.senders.mic).receiver.track

    return {
      screen: new MediaStream([screenVideoTrack, screenAudioTrack]),
      webCam: new MediaStream([webCamTrack]),
      mic: new MediaStream([micTrack]),
    }
  }

  private sendMessageToSocket(event: EventMessageToSocket, message: Record<string, unknown>) {
    if (this.isClosed) return

    socketClient.emit(event, {
      id: this.id,
      connectionId: this.connectionId,
      ...message,
    })
  }

  private onIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (!event.candidate || this.isClosed) return
    this.sendMessageToSocket('new_ice', { ice: event.candidate })
  }

  private onConnectionStateChange() {
    if (this.isClosed) return
    if (this.peer.connectionState === 'connected') {
      this.isNewOfferRequested = false
      return
    }
    if (!this.isInitiator || this.peer.connectionState !== 'failed') return

    void this.createOffer({ isIceRestart: true })
  }

  private applyVideoBitrate(sender: RTCRtpSender, bitrate: number, isHighPriority: boolean) {
    try {
      const parameters = sender.getParameters()
      if (!parameters.encodings?.length) return

      parameters.encodings = parameters.encodings.map((encoding) => ({
        ...encoding,
        maxBitrate: bitrate,
        ...(isHighPriority ? { priority: 'high' as const, networkPriority: 'high' as const } : {}),
      }))
      parameters.degradationPreference = 'maintain-framerate'
      void sender.setParameters(parameters).catch((error) => {
        console.error(error)
      })
    } catch (error) {
      console.error(error)
    }
  }

  setVideoBitrate(bitrate: number) {
    this.applyVideoBitrate(this.senders.screenVideo, bitrate, true)
    this.applyVideoBitrate(this.senders.webCam, bitrate, false)
  }

  setRemoteControlEnabled(enabled: boolean) {
    this.isRemoteControlEnabled = enabled
    this.sendMessageToPeer('remote_control_status', { enabled })
  }

  sendControlEvent(event: RemoteControlEvent) {
    const channel = this.channelControl.channel
    if (channel.readyState !== 'open') return
    if (event.type === 'mousemove' && channel.bufferedAmount > 64 * 1024) return

    try {
      channel.send(JSON.stringify(event))
    } catch (error) {
      console.error(error)
    }
  }

  sendMessageToPeer(event: EventMessageToPeer, message: unknown) {
    this.channelInfo.send(JSON.stringify({ event, message }))
  }

  private onInfoMessage(event: MessageEvent) {
    logger('onInfoMessage', event.data)
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
      case 'stream_track_pause':
        if (data.message === 'screen') {
          pauseSender(this.senders.screenVideo)
          pauseSender(this.senders.screenAudio)
        } else if (data.message === 'webCam') {
          pauseSender(this.senders.webCam)
        } else if (data.message === 'mic') {
          pauseSender(this.senders.mic)
        }
        this.emit('onStreamTrackPause', data.message as StreamType)
        break
      case 'stream_track_resume':
        if (data.message === 'screen') {
          resumeSender(this.senders.screenVideo)
          resumeSender(this.senders.screenAudio)
        } else if (data.message === 'webCam') {
          resumeSender(this.senders.webCam)
        } else if (data.message === 'mic') {
          resumeSender(this.senders.mic)
        }
        this.emit('onStreamTrackResume', data.message as StreamType)
        break
      case 'miniGameRequsest':
        this.emit('onMiniGameRequsest', data.message)
        break
      case 'remote_control_status': {
        const isAvailable = Boolean(data.message?.enabled)
        this.remoteControlAvailable = isAvailable
        this.emit('onRemoteControlStatus', isAvailable)
        break
      }
    }
  }

  private onControlMessage(event: MessageEvent) {
    try {
      const data: unknown = JSON.parse(event.data)
      if (!isRemoteControlEvent(data)) return
      this.emit('onControlEvent', data)
    } catch (error) {
      console.error(error)
    }
  }

  private onMiniGameMessage(event: MessageEvent) {
    const data = JSON.parse(event.data)
    this.emit('onMiniGameMessage', data)
  }

  sendMiniGameMessage(message: unknown) {
    this.channelMiniGame.send(JSON.stringify(message))
  }

  sendMiniGameRequsest(message: WebRTCMiniGameMessage) {
    this.channelInfo.send(JSON.stringify({ event: 'miniGameRequsest', message }))
  }

  sendMessageToChat(message: string) {
    this.channelChat.send(JSON.stringify({ message, type: 'text' }))
  }

  private sendToFileChat(data: ArrayBuffer, params: FileHeader, startWith: number = 0) {
    const dataid = params.id
    let chunknumber = startWith

    while (params.length > chunknumber * this.codec.chunkSize) {
      if (this.channelFile.channel.bufferedAmount > this.channelFile.channel.bufferedAmountLowThreshold) {
        this.channelFile.channel.onbufferedamountlow = () => {
          this.channelFile.channel.onbufferedamountlow = null
          this.sendToFileChat(data, params, chunknumber)
        }
        return
      }
      const ChunkParams: ChunkFileHeader = {
        length: params.length,
        type: params.type,
        name: params.name,
      }
      const chunk = this.codec.createChunk(data, dataid, chunknumber, ChunkParams)

      logger(
        `Send chunk ${dataid}, №${chunknumber}, with chunk.byteLength ${chunk.byteLength} of total length ${params.length}`,
        chunk
      )
      chunknumber++
      this.emit('onChatMessageLoadFile', {
        id: dataid.join(''),
        transmission: {
          isSender: true,
          length: params.length,
          loaded: chunknumber * this.codec.chunkSize,
        },
        isSystemMessage: true,
      })
      try {
        this.channelFile.send(chunk)
      } catch (error) {
        console.log('error', error)
      }
    }
  }

  async sendFileToChat(blob: Blob | ArrayBuffer, name?: string) {
    const id = this.codec.createNewId()
    const splitedName = name?.slice(-32)

    if (blob instanceof Blob) {
      const data = await blob.arrayBuffer()
      const headerData: FileHeader = {
        id,
        type: blob.type,
        length: data.byteLength,
        name: splitedName,
      }

      return this.sendToFileChat(data, headerData)
    }

    return this.sendToFileChat(blob, {
      length: blob.byteLength,
      id,
      name: splitedName,
    })
  }

  private onFileMessage(event: MessageEvent) {
    const message = event.data

    if (typeof message === 'object') {
      const chunk = this.codec.parseChunk(message)

      if (chunk) {
        logger(`recived chunkId ${chunk.chunkid} for data ${chunk.dataid}`, chunk)

        const stringId = chunk.dataid.join('')
        const temp = this.chatFileTempData.get(stringId)
        const dataLength = Number(chunk.params.length)
        const chunkType = String(chunk.params?.type)
        const chunkSize = Number(chunk.params?.chunkSize ?? this.codec.chunkSize)
        const fileName = String(chunk.params?.name)
        const params = {
          length: dataLength,
          loaded: this.codec.chunkSize * chunk.chunkid,
          type: chunkType,
          name: fileName,
        }

        this.emit('onChatMessageLoadFile', {
          id: stringId,
          blobParams: params,
          transmission: {
            length: params.length,
            loaded: this.codec.chunkSize * chunk.chunkid,
            isSender: false,
          },
        })

        if (temp) {
          temp.set(new Uint8Array(chunk.data), chunkSize * chunk.chunkid)
          logger(`recived chunk data №${chunk.chunkid} size ${chunk.data.byteLength}`)
        } else {
          const head = new Uint8Array(dataLength)

          head.set(new Uint8Array(chunk.data), chunkSize * chunk.chunkid)
          logger(`recived head data №${chunk.chunkid} size ${chunk.data.byteLength}`)
          this.chatFileTempData.set(stringId, head)
        }
        if (chunkSize * (chunk.chunkid + 1) >= dataLength) {
          const blobData = (temp?.buffer as ArrayBuffer) ?? chunk.data

          const file = new Blob([blobData], {
            type: chunkType,
          })

          logger('recived all data for create blob', file)
          this.emit('onChatMessageFile', {
            id: stringId,
            blob: file,
            blobParams: {
              ...params,
              length: 0,
              loaded: 0,
            },
          })
          this.chatFileTempData.delete(stringId)
        }
      }
    }
  }

  private onChatMessage(event: MessageEvent) {
    try {
      const { message, type } = JSON.parse(event.data)

      if (type === 'text') {
        return this.emit('onChatMessage', message)
      }
    } catch (error) {
      return console.log('error', error)
    }

    return console.log('unknown message', event.data)
  }

  get connectionState(): RTCPeerConnectionState {
    return this.peer.connectionState
  }

  getPeer(): RTCPeerConnection {
    return this.peer
  }

  close() {
    if (this.isClosed) return

    this.isClosed = true
    this.pendingCandidates = []
    this.chatFileTempData.clear()
    this.peer.onicecandidate = null
    this.peer.onconnectionstatechange = null
    this.peer.ontrack = null
    this.peer.ondatachannel = null
    this.peer.close()
  }
}
