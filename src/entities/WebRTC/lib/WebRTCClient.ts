import { Buffer } from 'buffer'

import { socketClient } from 'src/shared/api'
import { logger } from 'src/shared/lib/logger/Logger'
import { Emitter } from 'src/shared/lib/utils'

import { useWebRTCStore } from '../model/WebRTCStore'
import { MessageCodec } from './Codec/MessageCodec'
import type { StreamType } from '../types'
import { createBlackVideoTrack, createSilentAudioTrack, getIceServers, pauseSender, resumeSender } from '../utils'

type WebRTCClientConfig = { id: number }

type EventMessageToSocket = 'new_answer' | 'new_offer' | 'new_ice'

type EventMessageToPeer = 'stream_start' | 'stream_stop' | 'stream_status'

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
  }
}

type WebRTCClientEvents = {
  onStreamStart: StreamType
  onStreamStop: StreamType
  onChatMessage: string
  onChatMessageFile: WebRTCChatMessage
  onChatMessageLoadFile: WebRTCTransmissionMessage
}

export class WebRTCClient extends Emitter<WebRTCClientEvents> {
  id: number
  private peer: RTCPeerConnection
  private codec: MessageCodec
  private chatFileTempData: Map<string, Uint8Array> = new Map()
  private remoteSenderStreams: Record<StreamType, MediaStream | null> = {
    screen: null,
    webCam: null,
    mic: null,
  }
  private channelInfo: RTCDataChannel
  private channelChat: RTCDataChannel
  private channelFile: RTCDataChannel
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
    this.channelFile = this.peer.createDataChannel('file', {
      id: 1,
      protocol: 'arrayBuffer',
      negotiated: true,
    })
    this.codec = new MessageCodec({
      headerName: 'lalohead',
      maxChunkSize: 250000,
    })
    this.channelFile.binaryType = 'arraybuffer'
    this.channelFile.bufferedAmountLowThreshold = 1024 * 64 - 1
    this.channelFile.onopen = () => {
      if (this.peer.sctp?.maxMessageSize) {
        this.channelFile.bufferedAmountLowThreshold = this.peer.sctp.maxMessageSize
      }
    }
    this.channelFile.onmessage = this.onFileMessage.bind(this)

    this.channelInfo = this.peer.createDataChannel('info', {
      id: 2,
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
  }

  sendMessageToChat(message: string) {
    try {
      this.channelChat.send(JSON.stringify({ message, type: 'text' }))
    } catch (error) {
      console.log('error', error)
    }
  }
  private sendToFileChat(data: ArrayBuffer, params: FileHeader, startWith: number = 0) {
    const dataid = params.id
    let chunknumber = startWith

    while (params.length > chunknumber * this.codec.chunkSize) {
      if (this.channelFile.bufferedAmount > this.channelFile.bufferedAmountLowThreshold) {
        this.channelFile.onbufferedamountlow = () => {
          this.channelFile.onbufferedamountlow = null
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
          const blobPart: BlobPart = temp ? Buffer.from(temp) : chunk.data

          const file = new Blob([blobPart], {
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
    this.peer.close()
  }
}
