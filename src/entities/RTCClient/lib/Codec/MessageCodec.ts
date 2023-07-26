type MessageCodecConsturcorParams = {
  headerName: string
  headerSize?: number
  maxChunkSize?: number
  maxbitdepthForChunkId?: number
  idLength?: number
}

export class MessageCodec implements Required<MessageCodecConsturcorParams> {
  private readonly headerNameUTF8: Uint8Array

  private textEncoder = new TextEncoder()
  private textDecoder = new TextDecoder()

  readonly headerName
  readonly headerSize
  readonly chunkSize
  readonly maxChunkSize
  readonly maxbitdepthForChunkId
  readonly idLength: number

  constructor(params: MessageCodecConsturcorParams) {
    this.headerName = params.headerName
    this.headerNameUTF8 = this.textEncoder.encode(this.headerName)
    this.headerSize = params.headerSize ?? 256
    this.maxChunkSize = params.maxChunkSize ?? 1024 * 64 - 1
    this.chunkSize = Math.max(
      this.headerSize,
      this.maxChunkSize - this.headerSize
    )
    this.maxbitdepthForChunkId = params.maxbitdepthForChunkId ?? 4
    this.idLength = params.idLength ?? 16
  }

  createNewId() {
    const id = crypto.getRandomValues(new Uint8Array(this.idLength))
    return id
  }

  createChunk(
    data: ArrayBuffer,
    dataId: Uint8Array,
    chunkNumber: number,
    params: object
  ) {
    const header = new Uint8Array(this.headerSize)
    const chunkid = new Uint8Array(this.maxbitdepthForChunkId)
      .map((_, index) => {
        return chunkNumber >> (index * 8)
      })
      .reverse()
    const headerparams = this.textEncoder.encode(JSON.stringify(params))

    header.set(this.headerNameUTF8, 0)
    header.set(dataId, this.headerNameUTF8.byteLength)
    header.set(chunkid, this.headerNameUTF8.byteLength + this.idLength)
    header.set(
      headerparams,
      this.headerNameUTF8.byteLength + this.idLength + chunkid.byteLength
    )

    const dataChunk = data.slice(
      chunkNumber * this.chunkSize,
      (chunkNumber + 1) * this.chunkSize
    )
    const chunk = new Uint8Array(dataChunk.byteLength + header.byteLength)
    chunk.set(header, 0)
    chunk.set(new Uint8Array(dataChunk), header.byteLength)

    return chunk
  }

  parseChunk(data: ArrayBuffer) {
    const isCurrentChunk = !this.headerNameUTF8.find((value, index) => {
      if (value === this.headerNameUTF8[index]) {
        return false
      }
      return true
    })
    if (!isCurrentChunk) return null

    const chunkMeta = new Uint8Array(data.slice(0, this.headerSize))
    const chunkHeader = chunkMeta.slice(0, this.headerNameUTF8.byteLength)
    const dataid = chunkMeta.slice(
      chunkHeader.byteLength,
      chunkHeader.byteLength + this.idLength
    )
    const chunkid = chunkMeta.slice(
      chunkHeader.byteLength + dataid.byteLength,
      chunkHeader.byteLength + dataid.byteLength + this.maxbitdepthForChunkId
    )
    const chunkparams = chunkMeta
      .slice(
        chunkHeader.byteLength + dataid.byteLength + this.maxbitdepthForChunkId
      )
      .filter(Boolean)
    const params = this.textDecoder.decode(chunkparams)
    let jsonParams: Record<string, string | number | boolean>
    try {
      jsonParams = JSON.parse(params)
    } catch (error) {
      console.log(params)
      console.log(error)
      jsonParams = { length: chunkHeader.byteLength }
    }

    const rawData = data.slice(this.headerSize)

    const convertedChunkId = chunkid.reverse().reduce((prev, cur, index) => {
      prev = prev + (cur << (8 * index))
      return prev
    }, 0)

    return {
      data: rawData,
      dataid: dataid,
      chunkid: convertedChunkId,
      params: jsonParams,
    }
  }
}
