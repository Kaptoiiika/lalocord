import { ChatSchema } from "../types/ChatSchema"

export const getMessages = (state: ChatSchema) => state.messages

export const getSilentMode = (state: ChatSchema) => state.silent
export const getChangeSilentMode = (state: ChatSchema) => state.changeSilentMode

//actions
export const getActionAddMessage = (state: ChatSchema) => state.addMessage
