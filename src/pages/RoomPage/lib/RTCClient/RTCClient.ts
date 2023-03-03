import { UserModel } from "@/entities/User"
import { socketClient } from "@/shared/api/socket/socket"
import Emitter from "@/shared/lib/utils/Emitter/Emitter"
//@ts-ignore // no types
import freeice from "freeice"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { MediaStreamTypes } from "../../model/types/RoomRTCSchema"
import { RTCDataChanel } from "./RTCDataChanel"

export type Answer = { answer: RTCSessionDescription }
export type Offer = { offer: RTCSessionDescription }
export type Ice = { ice: RTCIceCandidateInit }
export type ClientId = { id: string }

type MessageType =
  | "offer"
  | "ice"
  | "answer"
  | "request_new_offer"
  | "sendNewStream"
  | "stopStream"
  | "text"
  | "file"

type RTCClientEvents = "updateStreams" | "iceconnectionStatusChange"

export class RTCClient extends Emitter<RTCClientEvents> {
  id: string
  user: UserModel
  peer: RTCPeerConnection | null
  channel: RTCDataChanel<MessageType>
  video: Record<MediaStreamTypes, MediaStream | null> = {
    media: null,
    webCam: null,
  }
  stream: Record<MediaStreamTypes, MediaStream | null> = {
    media: null,
    webCam: null,
  }

  private unknownVideo: MediaStream | null = null
  private unknownVideoType: MediaStreamTypes | null = null
  private offerCreater: boolean
  private senders: Record<MediaStreamTypes, RTCRtpSender[] | null> = {
    media: null,
    webCam: null,
  }
  private encodingSettings: RTCRtpEncodingParameters = {}

  constructor(user: UserModel, sendOffer?: boolean) {
    super()
    if (!RTCPeerConnection)
      throw new Error("Your browser does not support WEBRTC")

    this.peer = new RTCPeerConnection({
      iceServers: freeice(),
    })
    this.id = user.id
    this.user = user
    this.channel = new RTCDataChanel(this.peer, this.user)
    this.log("client:", user, this)

    this.peer.ontrack = this.reciveTrack.bind(this)

    this.peer.ondatachannel = (event) => {
      const remoteChannel = event.channel
      remoteChannel.onmessage = this.initDataChanel.bind(this)
    }
    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        const resp = { id: this.id, ice: event.candidate }
        socketClient.emit("new_ice", resp)
      }
    }

    this.offerCreater = !!sendOffer
    this.peer.onnegotiationneeded = () => {
      if (!this.offerCreater) this.createOffer()
      else this.requestNewOffer()
    }

    this.peer.oniceconnectionstatechange = (e) => {
      this.emit("iceconnectionStatusChange")
    }

    useRoomRTCStore.getState().addConnectedUsers(this)
    const sub = this.initStoreSubscribe()
    this.peer.onconnectionstatechange = (e) => {
      switch (this.peer?.connectionState) {
        case "disconnected":
        case "closed":
          sub()
          this.close()
        case "new":
        case "connected":
        case "failed":
        default:
          break
      }
    }
  }

  private initStoreSubscribe() {
    const { encodingSettings, webCamStream, displayMediaStream } =
      useRoomRTCStore.getState()
    this.encodingSettings = encodingSettings

    if (displayMediaStream) this.sendStream(displayMediaStream, "media")
    if (webCamStream) this.sendStream(webCamStream, "webCam")

    const sub = useRoomRTCStore.subscribe((state) => {
      if (state.webCamStream === null) this.stopStream("webCam")
      else if (state.webCamStream !== this.stream.webCam)
        this.sendStream(state.webCamStream, "webCam")
      this.stream.webCam = state.webCamStream

      if (state.displayMediaStream === null) this.stopStream("media")
      else if (state.displayMediaStream !== this.stream.media)
        this.sendStream(state.displayMediaStream, "media")
      this.stream.media = state.displayMediaStream

      if (state.encodingSettings !== this.encodingSettings) {
        this.encodingSettings = state.encodingSettings
        this.updateBitrate()
      }
    })

    return sub
  }

  private requestNewOffer() {
    if (!this.channel.channelIsOpen) return
    if (this.offerCreater) {
      this.createOffer()
    } else {
      this.channel.sendData("request_new_offer")
    }
    this.offerCreater = !this.offerCreater
  }

  async createAnswer(offer: RTCSessionDescription) {
    if (!this.peer) return
    await this.peer.setRemoteDescription(offer)
    const answer = await this.peer.createAnswer()
    await this.peer.setLocalDescription(answer)
    const resp = { id: this.id, answer: answer }
    this.log("createAnswer", answer)
    if (this.channel.channelIsOpen) this.channel.sendData("answer", answer)
    else socketClient.emit("new_answer", resp)
  }

  async createOffer() {
    if (!this.peer) return
    const offer = await this.peer.createOffer()
    await this.peer.setLocalDescription(offer)
    const data = { id: this.id, offer: offer }
    this.log("createdoffer", offer)
    if (this.channel.channelIsOpen) this.channel.sendData("offer", offer)
    else socketClient.emit("new_offer", data)
  }

  async saveAnswer(answer: RTCSessionDescription) {
    await this.peer?.setRemoteDescription(answer)
    this.updateBitrate()
  }

  saveIce(ice: RTCIceCandidateInit) {
    this.peer?.addIceCandidate(ice)
  }

  close() {
    if (!this.peer) return console.warn("Connection already close")
    this.channel.close()
    const tracks = [
      ...(this.video.media?.getTracks() || []),
      ...(this.video.webCam?.getTracks() || []),
    ]
    tracks.forEach((track) => {
      track.stop()
    })
    this.peer.close()
    this.senders = { media: null, webCam: null }
    this.video = {
      media: null,
      webCam: null,
    }
    this.peer = null
    this.log("peer closed")
  }

  async sendStream(stream: MediaStream, type: MediaStreamTypes) {
    if (!this.peer) return
    this.log("send stream")
    const [videoStream] = stream.getVideoTracks()
    const [audioStream] = stream.getAudioTracks()
    const currentSenders = this.senders[type]

    const senderVideo = currentSenders?.find(
      (s) => s.track?.kind === videoStream?.kind
    )
    const senderAudio = currentSenders?.find(
      (s) => s.track?.kind === audioStream?.kind
    )

    const senders = stream.getTracks().map(async (track) => {
      if (senderVideo && track.kind === "video") {
        await senderVideo.replaceTrack(track)
        return senderVideo
      }
      if (senderAudio && track.kind === "audio") {
        await senderAudio.replaceTrack(track)
        return senderAudio
      }

      this.channel.sendData("sendNewStream", type)
      return this.peer!.addTrack(track, stream) // this.peer checked from the top
    })

    this.senders[type] = await Promise.all(senders)
  }

  stopStream(type: MediaStreamTypes) {
    const senders = this.senders[type]
    if (!senders || senders.length === 0) return

    const transceivers = this.peer?.getTransceivers()
    transceivers?.forEach((transceiver) => {
      if (transceiver.currentDirection === "inactive") transceiver.stop()
    })
    this.senders[type] = null
    this.channel.sendData("stopStream", type)
  }

  private reciveTrack(event: RTCTrackEvent) {
    const stream = event.streams[0]
    const track = event.track
    this.log("reciveTrack", track)
    if (track.kind === "video") {
      this.unknownVideo = stream
    }
    this.accpetStream()
  }

  private acceptStreamType(type: MediaStreamTypes) {
    this.unknownVideoType = type
    this.accpetStream()
  }

  private accpetStream() {
    if (!this.unknownVideo) return
    const type = this.unknownVideoType
    switch (type) {
      case "media":
        this.video.media = this.unknownVideo
        break
      case "webCam":
        this.video.webCam = this.unknownVideo
        break
      default:
        return
    }
    this.unknownVideo = null
    this.emit("updateStreams")
  }

  private remoteClosedStream(type: MediaStreamTypes) {
    this.video[type] = null
    this.emit("updateStreams")
  }

  private updateBitrate() {
    if (!this.peer) return

    const videoSender = this.peer
      ?.getSenders()
      .filter((sender) => sender.track?.kind === "video")
    if (!videoSender) return
    videoSender?.map((sender) => {
      const params = sender.getParameters()
      console.log("video params", params)
      const encoders = params.encodings.map((encod) => {
        return {
          ...encod,
          ...this.encodingSettings,
          networkPriority: this.encodingSettings.priority,
        }
      })
      params.encodings = encoders
      sender.setParameters(params)
    })
  }

  private initDataChanel(e: MessageEvent) {
    try {
      const msg: { type: MessageType; data: any } = JSON.parse(e.data)
      this.log("reciveData", msg)

      if (!msg.type) return
      const { data, type } = msg

      switch (type) {
        case "request_new_offer":
          this.requestNewOffer()
          break
        case "answer":
          this.saveAnswer(data)
          break
        case "offer":
          this.createAnswer(data)
          break
        case "ice":
          this.saveIce(data)
          break
        case "ice":
          this.saveIce(data)
          break
        case "sendNewStream":
          this.acceptStreamType(data)
          break
        case "stopStream":
          this.remoteClosedStream(data)
          break
        case "file":
          this.channel.reciveBlobChunk(data)
          break
        case "text":
          this.channel.onNewMessage(data)
          break
        default:
          this.log(msg)
          break
      }
    } catch (error) {
      console.error(error)
    }
  }

  private log(...message: any) {
    if (__IS_DEV__) console.log(...message)
  }
}
