import { ChatSchema } from "../types/ChatSchem"

export const getMessages = (state: ChatSchema) =>
  state.messages

//actions
export const getActionAddMessage = (state: ChatSchema) =>
  state.addMessage
