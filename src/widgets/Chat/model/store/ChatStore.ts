import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messageList: [new Map()],

  addNewMessage(message, user) {
    const { messageList } = get()
    messageList[0].set(message.id, { message: message, user: user })
    set((state) => ({ ...state, messageList: [messageList[0]] }))
  },

  deleteMessage(id) {
    const { messageList } = get()
    messageList[0].delete(id)
    set((state) => ({ ...state, messageList: [messageList[0]] }))
  },

  clearMessages: () => {
    set((state) => ({ ...state, messages: [], messageList: [new Map()] }))
  },
})

export const useChatStore = create(store)
