// eslint-disable-next-line boundaries/element-types
import type { UserModel } from "@/entities/User"
import Emitter from "@/shared/lib/utils/Emitter/Emitter"
// eslint-disable-next-line boundaries/element-types
import type { MessageModel } from "@/widgets/Chat/model/types/ChatSchema"

export type DataChunk = {
  id: string
  data: string
  type: string
  size: number
  current: number
}

export type BaseMessageKeys = "file" | "text"

type RTCDataChanelEvents = { newMessage: MessageModel }

export class RTCDataChanel<
  MessageKeys extends string = string
> extends Emitter<RTCDataChanelEvents> {
  peer: RTCPeerConnection | null
  channel: RTCDataChannel
  user: UserModel
  channelIsOpen = false
  private messagesBuffer: string[] = []

  constructor(peer: RTCPeerConnection, user: UserModel) {
    super()
    this.peer = peer
    this.user = user

    this.channel = this.peer.createDataChannel("text")
    this.channel.binaryType = "arraybuffer"
    this.channel.onopen = () => {
      this.channelIsOpen = true
      this.messagesBuffer.forEach((data) => {
        this.sendMessageToChanel(data)
      })
    }
    this.channel.onclose = () => {
      this.channelIsOpen = false
    }
  }

  async sendBlob(blob: Blob) {}

  sendMessage(msg: string) {
    this.sendData("text", msg)
  }

  async reciveBlobChunk(fileChunk: DataChunk) {}

  sendData(type: MessageKeys | BaseMessageKeys, msg?: unknown) {
    const json = JSON.stringify({ type: type, data: msg })
    this.sendMessageToChanel(json)
  }

  private sendMessageToChanel(data: any) {
    if (!this.channelIsOpen) {
      this.messagesBuffer.push(data)
      return
    }

    try {
      this.channel.send(data)
    } catch (error) {
      console.warn(error)
      this.messagesBuffer.push(data)
    }
  }

  onNewMessage() {}

  close() {
    this.messagesBuffer = []
    this.channel.close()
  }
}
