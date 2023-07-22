import { ChatSchema } from "../types/ChatSchema"

export const getMessages = (state: ChatSchema) => state.messageList

//actions
export const getActionAddMessage = (state: ChatSchema) => state.addMessage
