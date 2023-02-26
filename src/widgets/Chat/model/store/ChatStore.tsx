import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchem"
import notofficationSound from "@/shared/assets/audio/notification.mp3"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messages: [],
  audio: new Audio(notofficationSound),

  addMessage(message, playSound) {
    if (playSound) {
      const { audio } = get()
      audio.currentTime = 0
      try {
        audio.play()
      } catch (error) {}
    }

    set((state) => ({ ...state, messages: [...state.messages, message] }))
  },
})

export const useChatStore = create(store)
