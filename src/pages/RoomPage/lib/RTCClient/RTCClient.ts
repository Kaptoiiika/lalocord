import { UserModel } from "@/entities/User"
import { socketClient } from "@/shared/api/socket/socket"
import Emitter from "@/shared/lib/utils/Emitter/Emitter"
//@ts-ignore // no types
import freeice from "freeice"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { RTCDataChanel } from "./RTCDataChanel"
import { RTCMedia } from "./RTCMedia"

export type Answer = { answer: RTCSessionDescription }
export type Offer = { offer: RTCSessionDescription }
export type Ice = { ice: RTCIceCandidateInit }
export type ClientId = { id: string }

type MessageType =
  | "offer"
  | "ice"
  | "answer"
  | "request_new_offer"
  | "text"
  | "file"

type RTCClientEvents = "iceconnectionStatusChange"

export class RTCClient extends Emitter<RTCClientEvents> {
  id: string
  user: UserModel
  peer: RTCPeerConnection | null
  channel: RTCDataChanel<MessageType>
  media: RTCMedia

  private offerCreater: boolean

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
    this.media = new RTCMedia(this.peer)
    useRoomRTCStore.getState().addConnectedUsers(this)

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

    this.peer.onconnectionstatechange = (e) => {
      switch (this.peer?.connectionState) {
        case "disconnected":
        case "closed":
          this.close()
        case "new":
        case "connected":
        case "failed":
        default:
          break
      }
    }
    this.log("New RTCClient", this)
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
    this.media.updateBitrate()
  }

  saveIce(ice: RTCIceCandidateInit) {
    this.peer?.addIceCandidate(ice)
  }

  async close() {
    if (!this.peer) return console.warn("Connection already close")
    this.channel.close()
    this.media.close()
    await this.peer.setLocalDescription()
    this.peer.close()
    this.peer = null
    this.log("peer closed")
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
