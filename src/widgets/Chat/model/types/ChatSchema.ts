import type { UserModel } from 'src/entities/User'
import type { WebRTCChatMessage, WebRTCTransmissionMessage } from 'src/entities/WebRTC'

export interface ChatSchema {
  messageList: [Map<string, MessageModelNew>]
  messageLength: number
  addNewMessage: (message: ChatMessageType, user: UserModel) => void
  deleteMessage: (id: string) => void
  clearMessages: () => void
}

export interface MessageModelNew {
  user: UserModel
  message: ChatMessageType
}

export type ChatMessageType = {
  type: 'text' | 'file' | 'transmission'
} & WebRTCChatMessage &
  Partial<WebRTCTransmissionMessage>
