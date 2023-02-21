import { socketClient } from "@/shared/api/socket/socket"
import Emitter from "@/shared/lib/utils/Emitter/Emitter"
//@ts-ignore // no types
import freeice from "freeice"
import { useRoomRTCStore } from "../../model/store/store/RoomRTCStore"
import { MediaStreamTypes } from "../../model/store/types/RoomRTCSchema"

export type Answer = { answer: RTCSessionDescription }
export type Offer = { offer: RTCSessionDescription }
export type Ice = { ice: RTCIceCandidateInit }
export type ClientId = { id: string }
export type MessageType =
  | "offer"
  | "ice"
  | "answer"
  | "request_new_offer"
  | "sendNewStream"
  | "stopStream"
  | "streamAccepted"
  | "data"

export type RTCClientEvents = "updateStreams" | "close" | "newMessage"

export class RTCClient extends Emitter<RTCClientEvents> {
  id: string
  peer: RTCPeerConnection | null
  channel: RTCDataChannel
  video: Record<MediaStreamTypes, MediaStream | null> = {
    media: null,
    webCam: null,
  }
  messages: string[] = []

  private unknownVideo: MediaStream | null = null
  private unknownVideoType: MediaStreamTypes | null = null
  private channelIsOpen = false
  private offerCreater: boolean
  private senders: Record<MediaStreamTypes, RTCRtpSender[] | null> = {
    media: null,
    webCam: null,
  }
  private encodingSettings: RTCRtpEncodingParameters = {}

  constructor(id: string, sendOffer?: boolean) {
    super()
    this.id = id
    if (!RTCPeerConnection)
      throw new Error("Your browser does not support WEBRTC")
    this.peer = new RTCPeerConnection({
      iceServers: freeice(),
    })
    this.log("client:", id, this)

    this.channel = this.peer.createDataChannel("text")
    this.channel.onopen = () => {
      this.channelIsOpen = true
      this.messages.forEach((json) => {
        this.channel.send(json)
      })
    }
    this.channel.onclose = () => {
      this.channelIsOpen = false
    }

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
      if (state.webCamStream) this.sendStream(state.webCamStream, "webCam")
      else this.stopStream("webCam")
      if (state.displayMediaStream)
        this.sendStream(state.displayMediaStream, "media")
      else this.stopStream("media")

      if (state.encodingSettings !== this.encodingSettings) {
        this.encodingSettings = state.encodingSettings
        this.updateBitrate()
      }
    })

    return sub
  }

  private requestNewOffer() {
    if (!this.channelIsOpen) return
    if (this.offerCreater) {
      this.createOffer()
    } else {
      this.sendData("request_new_offer")
    }
    this.offerCreater = !this.offerCreater
  }

  async createAnswer(offer: RTCSessionDescription) {
    if (!this.peer) return
    await this.peer.setRemoteDescription(offer)
    const answer = await this.peer.createAnswer()
    await this.peer.setLocalDescription(answer)
    const resp = { id: this.id, answer: answer }
    if (this.channelIsOpen) this.sendData("answer", answer)
    else socketClient.emit("new_answer", resp)
  }

  async createOffer() {
    if (!this.peer) return
    const offer = await this.peer.createOffer()
    await this.peer.setLocalDescription(offer)
    const data = { id: this.id, offer: offer }
    if (this.channelIsOpen) this.sendData("offer", offer)
    else socketClient.emit("new_offer", data)
  }

  async saveAnswer(answer: RTCSessionDescription) {
    await this.peer?.setRemoteDescription(answer)
  }

  saveIce(ice: RTCIceCandidateInit) {
    this.peer?.addIceCandidate(ice)
  }

  close() {
    if (!this.peer) return console.warn("Connection already close")
    this.peer.close()
    this.channel.close()
    this.peer = null
    this.emit("close")
  }

  sendMessage(msg: string) {
    this.sendData("data", msg)
  }

  async sendStream(stream: MediaStream, type: MediaStreamTypes) {
    if (!this.peer) return
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

      this.sendData("sendNewStream", type)
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
    this.sendData("stopStream", type)
  }

  private reciveTrack(event: RTCTrackEvent) {
    const stream = event.streams[0]
    const track = event.track
    this.log("reciveTrack")
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
    console.log(this)
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
    this.sendData("streamAccepted")
    this.emit("updateStreams")
  }

  private remoteClosedStream(type: MediaStreamTypes) {
    this.video[type] = null
    this.emit("updateStreams")
  }

  private sendData(type: MessageType, msg?: unknown) {
    const json = JSON.stringify({ type: type, data: msg })
    this.log("sendData", { type: type, data: msg })
    if (!this.channelIsOpen) {
      this.messages.push(json)
      return
    }
    this.channel.send(json)
  }

  updateBitrate() {
    const videoSender = this.peer
      ?.getSenders()
      .filter((sender) => sender.track?.kind === "video")
    if (!videoSender) return
    videoSender?.map((sender) => {
      const params = sender.getParameters()
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
        case "streamAccepted":
          this.updateBitrate()
          break
        case "data":
          this.emit("newMessage", data)
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
