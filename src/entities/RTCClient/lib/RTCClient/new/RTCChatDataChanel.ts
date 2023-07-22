import Emitter from "@/shared/lib/utils/Emitter/Emitter"
import {
  IRTCChatDataChanel,
  RTCChatDataChanelEvents,
} from "./types/RTCChatDataChanel"

type FileHeader = {
  id: Uint8Array
  length: number
  type?: string
}

const headerUTF8 = new TextEncoder().encode("lalohead")
const headerLeangth = 256
const idLength = 16
const maxbitdepthForChunkId = 4

export class RTCChatDataChanel
  extends Emitter<RTCChatDataChanelEvents>
  implements IRTCChatDataChanel
{
  readonly channel: RTCDataChannel
  private _isOpen = false
  get isOpen() {
    return this._isOpen
  }
  private tempData = new Map()

  constructor(private readonly peer: RTCPeerConnection, label = "chat") {
    super()

    this.channel = this.peer.createDataChannel(label)
    this.channel.binaryType = "arraybuffer"
    this.channel.bufferedAmountLowThreshold = 1024 * 64 - 1
    this.channel.bufferedAmount
    this.channel.onopen = () => {
      this._isOpen = true
    }
    this.channel.onclose = () => {
      this._isOpen = false
    }

    const datachannelfunction = (e: RTCDataChannelEvent) => {
      if (e.channel.label === label) {
        const fn = (e: MessageEvent) => {
          this.onNewMessage(e.data)
        }
        e.channel.onmessage = fn.bind(this)
        this.peer.removeEventListener("datachannel", datachannelfunction)
      }
    }
    this.peer.addEventListener("datachannel", datachannelfunction)
  }

  private async send(
    data: string | ArrayBuffer,
    params: FileHeader,
    startWith = 0
  ) {
    if (typeof data === "string") this.channel.send(data)
    if (typeof data === "object") {
      const dataid = params.id
      const maxChunkSize = this.channel.bufferedAmountLowThreshold
      const chunkSize = maxChunkSize - headerLeangth
      let chunknumber = startWith

      while (data.byteLength > chunknumber * chunkSize && this.isOpen) {
        if (
          this.channel.bufferedAmount > this.channel.bufferedAmountLowThreshold
        ) {
          this.channel.onbufferedamountlow = () => {
            this.channel.onbufferedamountlow = null
            this.send(data, params, chunknumber)
          }
          return
        }
        const header = new Uint8Array(headerLeangth)
        const chunkid = new Uint8Array(maxbitdepthForChunkId)
          .map((_, index) => {
            return chunknumber >> (index * 8)
          })
          .reverse()
        header.set(headerUTF8, 0)
        header.set(dataid, headerUTF8.byteLength)
        header.set(chunkid, headerUTF8.byteLength + dataid.byteLength)

        const dataChunk = data.slice(
          chunknumber * chunkSize,
          (chunknumber + 1) * chunkSize
        )
        const chunk = new Uint8Array(dataChunk.byteLength + header.byteLength)

        chunk.set(header, 0)
        chunk.set(new Uint8Array(dataChunk), header.byteLength)
        this.log(
          `send chunk withRawData${dataChunk.byteLength} №${chunkid} id:${dataid}`,
          chunk
        )

        chunknumber++
        this.channel.send(chunk)
      }
    }
  }

  private isRecivedChunk(data: ArrayBuffer) {
    const isChunk = !headerUTF8.find((value, index) => {
      if (value === headerUTF8[index]) {
        return false
      }
      return true
    })

    if (isChunk) {
      const chunkData = new Uint8Array(data.slice(0, headerLeangth))
      const chunkHeader = chunkData.slice(0, headerUTF8.byteLength)
      const dataid = chunkData.slice(
        chunkHeader.byteLength,
        chunkHeader.byteLength + idLength
      )
      const chunkid = chunkData.slice(
        chunkHeader.byteLength + dataid.byteLength,
        chunkHeader.byteLength + dataid.byteLength + maxbitdepthForChunkId
      )

      const rawData = data.slice(headerLeangth)

      const convertedChunkId = chunkid.reverse().reduce((prev, cur, index) => {
        prev = prev + (cur << (8 * index))
        return prev
      }, 0)

      return {
        dataid: dataid,
        chunkid: convertedChunkId,
        data: rawData,
      }
    }
  }

  onNewMessage(data: string | ArrayBuffer) {
    if (typeof data === "string") {
      this.emit("newMessage", { type: "text", message: data })
    }

    if (typeof data === "object") {
      const chunk = this.isRecivedChunk(data)
      if (chunk) {
        this.log(
          `recived chunkId ${chunk.chunkid} for data ${chunk.dataid}`,
          chunk
        )
        return
      }
    }
  }

  async sendBlob(blob: Blob | ArrayBuffer) {
    const id = this.getNewId()
    if (blob instanceof Blob) {
      const data = await blob.arrayBuffer()
      const headerData: FileHeader = {
        id: id,
        type: blob.type,
        length: data.byteLength,
      }

      this.log(
        `prepare data ${headerData.id} for send rawdatalength:${data.byteLength}`
      )
      return this.send(data, headerData)
    }

    this.log(`prepare data ${id} for send rawdatalength:${blob.byteLength}`)
    return this.send(blob, { length: blob.byteLength, id: id })
  }

  async sendMessage(message: string) {
    this.send(message, { length: message.length, id: this.getNewId() })
  }

  close() {
    this.channel.close()
  }

  private getNewId() {
    const id = crypto.getRandomValues(new Uint8Array(idLength))
    return id
  }

  private log(...arg0: any) {
    if (__IS_DEV__) {
      console.log(...arg0)
    }
  }
}
