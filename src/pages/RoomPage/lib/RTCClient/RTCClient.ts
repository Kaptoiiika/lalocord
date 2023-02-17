import { socketClient } from "@/shared/api/socket/socket"
import Emitter from "@/shared/lib/utils/Emitter/Emitter"
//@ts-ignore // no types
import freeice from "freeice"

export type Answer = { answer: RTCSessionDescription }
export type Offer = { offer: RTCSessionDescription }
export type Ice = { ice: RTCIceCandidateInit }
export type ClientId = { id: string }
export type MessageType =
  | "offer"
  | "ice"
  | "answer"
  | "request_new_offer"
  | "receiveTrack"
  | "stopTrack"
  | "data"

export type RTCClientEvents = "streamVideo" | "close" | "newMessage"

export class RTCClient extends Emitter<RTCClientEvents> {
  id: string
  peer: RTCPeerConnection | null
  channel: RTCDataChannel
  channelIsOpen = false
  video: MediaStream | null = null
  offerCreater: boolean
  messages: string[] = []

  constructor(id: string, sendOffer?: boolean) {
    super()
    this.id = id
    this.peer = new RTCPeerConnection({
      iceServers: freeice(),
    })

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

    this.peer.ontrack = (event) => {
      const { streams, track } = event
      if (track.kind === "video") {
        this.video = streams[0]
        this.emit("streamVideo", streams[0])
        this.sendData("receiveTrack")
      }
    }

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

  sendStream(stream: MediaStream) {
    const [videoStream] = stream.getVideoTracks()
    const [audioStream] = stream.getAudioTracks()

    const senderVideo = this.peer
      ?.getSenders()
      .find((s) => s.track?.kind === videoStream?.kind)
    const senderAudio = this.peer
      ?.getSenders()
      .find((s) => s.track?.kind === audioStream?.kind)

    stream.getTracks().forEach((track) => {
      if (senderVideo && track.kind === "video") {
        return senderVideo.replaceTrack(track)
      }
      if (senderAudio && track.kind === "audio") {
        return senderAudio.replaceTrack(track)
      }
      if (!this.peer) return

      this.peer.addTrack(track, stream)
    })
  }

  stopStream() {
    const senderVideo = this.peer
      ?.getSenders()
      .find((s) => s.track?.kind === "video")
    if (senderVideo) {
      this.sendData("stopTrack")
      this.peer?.removeTrack(senderVideo)
    }
  }

  private sendData(type: MessageType, msg?: unknown) {
    const json = JSON.stringify({ type: type, data: msg })
    console.log("sendData", json)
    if (!this.channelIsOpen) {
      this.messages.push(json)
      return
    }
    this.channel.send(json)
  }

  async updateBitrate() {
    const videoSender = this.peer
      ?.getSenders()
      .filter((sender) => sender.track?.kind === "video")
    videoSender?.forEach((sender) => {
      const params = sender.getParameters()
      params.encodings.forEach((encod) => {
        encod.maxBitrate = 1024 * 1024 * 50
        encod.priority = "medium"
        encod.scaleResolutionDownBy = 1.0
      })
      sender.setParameters(params)
    })
  }

  private initDataChanel(e: MessageEvent) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg: { type: MessageType; data: any } = JSON.parse(e.data)
      console.log("reciveData", msg)

      if (!msg.type) return
      const { data, type } = msg

      switch (type) {
        case "request_new_offer":
          this.requestNewOffer()
          break
        case "receiveTrack":
          this.updateBitrate()
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
        case "stopTrack":
          this.video = null
          this.emit("streamVideo", null)
          break
        case "data":
        default:
          console.log(msg)
          this.emit("newMessage", data)
          break
      }
    } catch (error) {
      console.error(error)
    }
  }
}
