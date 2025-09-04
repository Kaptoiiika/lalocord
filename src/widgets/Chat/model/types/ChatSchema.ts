import type { UserModel } from 'src/entities/User'
import type { WebRTCChatMessage, WebRTCTransmissionMessage } from 'src/entities/WebRTC'
import type { WebRTCMiniGameMessage } from 'src/entities/WebRTC/lib/WebRTCClient'

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
  type: 'text' | 'file' | 'transmission' | 'miniGameRequest'
} & WebRTCChatMessage &
  Partial<WebRTCTransmissionMessage> &
  Partial<WebRTCMiniGameMessage>
