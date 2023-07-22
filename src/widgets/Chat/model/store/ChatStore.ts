import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"
import { useAudioEffectStore } from "@/entities/AudioEffect"
import { AudioName } from "@/entities/AudioEffect/model/types/AudioEffectSchema"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messages: [],
  messageList: [new Map()],
  addMessage(message, silent = false) {
    if (!silent) useAudioEffectStore.getState().play(AudioName.notification)
    if (typeof message.data === "string") {
      set((state) => ({ ...state, messages: [...state.messages, message] }))
    } else {
      set((state) => ({
        ...state,
        messages: [...state.messages, message],
      }))
    }
  },
  addNewMessage(message, user) {
    const { messageList } = get()
    messageList[0].set(message.id, { message: message, user: user })
    console.log(messageList[0])
    set((state) => ({ ...state, messageList: [messageList[0]] }))
  },
  clearMessages: () => {
    set((state) => ({ ...state, messages: [], messageList: [new Map()] }))
  },
})

export const useChatStore = create(store)
