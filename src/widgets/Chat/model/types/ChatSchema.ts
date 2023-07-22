import { RTCChatMessage } from "@/entities/RTCClient"
import { UserModel } from "@/entities/User"

export interface ChatSchema {
  messages: MessageModel[]
  messageList: [Map<string, MessageModelNew>]
  addNewMessage: (message: RTCChatMessage, user: UserModel) => void
  addMessage: (message: MessageModel, silent?: boolean) => void
  clearMessages: () => void
}

export interface MessageModelNew {
  user: UserModel
  message: RTCChatMessage
}

export interface MessageModel {
  user: UserModel
  data: MessageData
}

export type MessageData = string | FileMessage
export type FileMessage = { blob: Blob; name?: string }
