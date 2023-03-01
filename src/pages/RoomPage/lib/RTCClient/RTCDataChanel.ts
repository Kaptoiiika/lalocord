import { UserModel } from "@/entities/User"
import { convertBlobToBase64 } from "@/shared/lib/utils/Blob/convertBlobToBase64/convertBlobToBase64"
import { covertBase64ToBlob } from "@/shared/lib/utils/Blob/covertBase64ToBlob/covertBase64ToBlob"
import { splitStringToChunks } from "@/shared/lib/utils/String/splitStringToChunks"
import { useChatStore } from "@/widgets/Chat/model/store/ChatStore"
import { MessageData, MessageModel } from "@/widgets/Chat/model/types/ChatSchem"
//@ts-ignore // no types

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
  user: UserModel
  channelIsOpen = false
  private messagesBuffer: string[] = []
  private fileBuffer: Record<string, DataChunk[]> = {}

  constructor(peer: RTCPeerConnection, user: UserModel) {
    this.peer = peer
    this.user = user

    this.channel = this.peer.createDataChannel("text")
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

  async sendBlob(blob: Blob) {
    const MAX_SIZE_CHUNK = 1024 * 32 * 2
    const MAX_STACK = 255
    if (blob.size > MAX_SIZE_CHUNK * MAX_STACK)
      throw new Error(
        `File size ${(blob.size / 1024 / 1024).toFixed(
          3
        )}mb exceeded maximum value ${(
          (MAX_SIZE_CHUNK * MAX_STACK) /
          1024 /
          1024
        ).toFixed(3)}mb `
      )

    const data = await convertBlobToBase64(blob)
    const stringChunks = splitStringToChunks(data, MAX_SIZE_CHUNK)
    const id = Math.random().toString(16).slice(2)

    stringChunks?.forEach((chunk, index) => {
      const dataChunk: DataChunk = {
        id: id,
        data: chunk,
        type: blob.type,
        size: stringChunks.length,
        current: index + 1,
      }
      this.sendData("file", dataChunk)
    })
  }

  sendMessage(msg: string) {
    this.sendData("text", msg)
  }

  async reciveBlobChunk(fileChunk: DataChunk) {
    if (fileChunk.size === 1)
      return this.onNewMessage({
        type: fileChunk.type,
        src: fileChunk.data,
      })
    const currentFileId = fileChunk.id
    const totalSize = fileChunk.size - 1
    const currentIndex = fileChunk.current - 1

    if (!this.fileBuffer[currentFileId]) this.fileBuffer[currentFileId] = []
    this.fileBuffer[currentFileId][currentIndex] = fileChunk

    if (currentIndex === totalSize) {
      const data = this.fileBuffer[currentFileId]
        .map((chunk) => chunk.data)
        .join("")
      delete this.fileBuffer[currentFileId]
      const blob = await covertBase64ToBlob(data)
      const srcURL = URL.createObjectURL(blob)
      return this.onNewMessage({ type: fileChunk.type, src: srcURL })
    }
  }

  sendData(type: MessageKeys|BaseMessageKeys, msg?: unknown) {
    const json = JSON.stringify({ type: type, data: msg })
    this.sendMessageToChanel(json)
  }

  private sendMessageToChanel(data: any) {
    if (!this.channelIsOpen) {
      this.messagesBuffer.push(data)
      return
    }

    this.channel.send(data)
  }

  onNewMessage(msg: MessageData) {
    const message: MessageModel = { data: msg, user: this.user }
    useChatStore.getState().addMessage(message, true)
  }

  close() {
    this.channel.close()
    this.messagesBuffer = []
    this.fileBuffer = {}
  }
}
