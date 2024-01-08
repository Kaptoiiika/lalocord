export type RTCChatMessage = {
  id: string
  type: "text" | "file" | "fileParams" | "transmission"
  message?: string
  blob?: Blob
  blobParams?: {
    length: number
    loaded: number
    type?: string
    name?: string
  }
  transmission?: {
    length: number
    loaded: number
  }
  isSystemMessage?: boolean
}

export type TransmissionMessage = Pick<
  RTCChatMessage,
  "id" | "transmission" | "type" | "isSystemMessage" | "blobParams"
>

export type RTCChatDataChanelEvents = {
  newMessage: RTCChatMessage
  transmission: TransmissionMessage
}

export interface IRTCChatDataChanel {
  readonly channel: RTCDataChannel
  readonly isOpen: boolean

  readonly sendBlob: (blob: Blob) => void
  readonly sendMessage: (message: string) => void
  readonly onNewMessage: (data: string | ArrayBuffer) => void
  readonly close: () => void
}
