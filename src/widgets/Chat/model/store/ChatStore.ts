import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messageList: [new Map()],
  messageLeangth: 0,

  addNewMessage(message, user) {
    const { messageList, messageLeangth } = get()

    const map = messageList[0]
    if (map.has(message.id)) {
      map.set(message.id, { message: message, user: user })
      set((state) => ({ ...state, messageList: [map] }))
    } else {
      map.set(message.id, { message: message, user: user })
      set((state) => ({
        ...state,
        messageList: [map],
        messageLeangth: messageLeangth + 1,
      }))
    }
  },

  deleteMessage(id) {
    const { messageList, messageLeangth } = get()
    const isDeleted = messageList[0].delete(id)
    set((state) => ({
      ...state,
      messageList: [messageList[0]],
      messageLeangth: isDeleted ? messageLeangth - 1 : messageLeangth,
    }))
  },

  clearMessages: () => {
    set((state) => ({
      ...state,
      messages: [],
      messageList: [new Map()],
      messageLeangth: 0,
    }))
  },
})

export const useChatStore = create(store)
