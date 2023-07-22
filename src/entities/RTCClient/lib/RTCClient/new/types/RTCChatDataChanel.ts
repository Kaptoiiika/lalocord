export type RTCChatMessage = {
  id: string
  type: "text" | "file" | "fileParams"
  message?: string
  blob?: Blob
  blobParams?: {
    length: number
    loaded: number
    type?: string
  }
}

export type RTCChatDataChanelEvents = {
  newMessage: RTCChatMessage
}

export interface IRTCChatDataChanel {
  readonly channel: RTCDataChannel
  readonly isOpen: boolean

  readonly sendBlob: (blob: Blob) => void
  readonly sendMessage: (message: string) => void
  readonly onNewMessage: (data: string | ArrayBuffer) => void
  readonly close: () => void
}
