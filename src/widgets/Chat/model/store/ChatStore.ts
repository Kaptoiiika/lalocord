import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messageList: [new Map()],
  messageLength: 0,

  addNewMessage(message, user) {
    const { messageList, messageLength } = get()

    const map = messageList[0]
    if (map.has(message.id)) {
      map.set(message.id, { message: message, user: user })
      set((state) => ({ ...state, messageList: [map] }))
    } else {
      map.set(message.id, { message: message, user: user })
      set((state) => ({
        ...state,
        messageList: [map],
        messageLength: messageLength + 1,
      }))
    }
  },

  deleteMessage(id) {
    const { messageList, messageLength } = get()
    const isDeleted = messageList[0].delete(id)
    set((state) => ({
      ...state,
      messageList: [messageList[0]],
      messageLength: isDeleted ? messageLength - 1 : messageLength,
    }))
  },

  clearMessages: () => {
    set((state) => ({
      ...state,
      messages: [],
      messageList: [new Map()],
      messageLength: 0,
    }))
  },
})

export const useChatStore = create(store)
