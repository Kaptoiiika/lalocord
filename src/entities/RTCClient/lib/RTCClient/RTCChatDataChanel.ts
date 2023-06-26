import Emitter from "@/shared/lib/utils/Emitter/Emitter"

export type DataChunk = {
  id: string
  data: string
  type: string
  size: number
  current: number
}

type RTCDataChanelEvents = "message"

export class RTCChatDataChanel extends Emitter<RTCDataChanelEvents> {
  peer: RTCPeerConnection | null
  channel: RTCDataChannel
  channelIsOpen = false

  constructor(peer: RTCPeerConnection) {
    super()
    this.peer = peer

    this.channel = this.peer.createDataChannel("chat")
    this.channel.binaryType = "arraybuffer"
    this.channel.onopen = () => {
      this.channelIsOpen = true
    }
    this.channel.onclose = () => {
      this.channelIsOpen = false
    }
  }

  async sendBlob(blob: Blob) {}

  async sendMessage(data: any) {
    this.channel.send(data)
  }

  onNewMessage() {}

  close() {
    this.channel.close()
  }
}
