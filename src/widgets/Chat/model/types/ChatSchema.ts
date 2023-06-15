import { UserModel } from "@/entities/User"

export interface ChatSchema {
  messages: MessageModel[]
  silent: boolean

  addMessage: (message: MessageModel, silent?: boolean) => void
  changeSilentMode: (silent: boolean) => void
}

export interface MessageModel {
  user: UserModel
  data: MessageData
}

export type MessageData = string | FileMessage
export type FileMessage = { type: FileMessageType; src: string }
export type FileMessageType = "image" | string
