import { RTCChatMessage } from "@/entities/RTCClient"
import { UserModel } from "@/entities/User"

export interface ChatSchema {
  messageList: [Map<string, MessageModelNew>]
  messageLeangth: number
  addNewMessage: (message: RTCChatMessage, user: UserModel) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
}

export interface MessageModelNew {
  user: UserModel
  message: RTCChatMessage
}
