import { logger } from "@/shared/lib/logger/Logger"

export type DataChunk = {
  id: string
  data: string
  type: string
  size: number
  current: number
}

export type BaseMessageKeys = "file" | "text"

export class RTCDataChanel<MessageKeys extends string = string> {
  peer: RTCPeerConnection | null
  channel: RTCDataChannel
  channelIsOpen = false
  private messagesBuffer: string[] = []

  constructor(peer: RTCPeerConnection) {
    this.peer = peer

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

  sendMessage(msg: string) {
    this.sendData("text", msg)
  }

  sendData(type: MessageKeys | BaseMessageKeys, msg?: unknown) {
    const json = JSON.stringify({ type: type, data: msg })
    this.sendMessageToChanel(json)
  }

  private sendMessageToChanel(data: any) {
    logger('sendMessageToChanel', data)
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

  close() {
    this.messagesBuffer = []
    this.channel.close()
  }

  
}
