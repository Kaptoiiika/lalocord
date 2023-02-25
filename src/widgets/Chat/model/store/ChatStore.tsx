import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchem"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messages: [],

  addMessage(message) {
    set((state) => ({ ...state, messages: [...state.messages, message] }))
  },
})

export const useChatStore = create(store)
