export type Message = {
  type: "text" | "file"
  message?: string
  blob?: Blob
}

export type RTCChatDataChanelEvents = {
  newMessage: Message
}

export interface IRTCChatDataChanel {
  readonly channel: RTCDataChannel
  readonly isOpen: boolean

  readonly sendBlob: (blob: Blob) => void
  readonly sendMessage: (message: string) => void
  readonly onNewMessage: (data: string | ArrayBuffer) => void
  readonly close: () => void
}
