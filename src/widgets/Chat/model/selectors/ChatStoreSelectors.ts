import type { ChatSchema } from '../types/ChatSchema'

export const getMessages = (state: ChatSchema) => state.messageList
