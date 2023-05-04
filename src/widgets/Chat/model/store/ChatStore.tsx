import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"
import notofficationSound from "@/shared/assets/audio/notification.mp3"

const audio = new Audio(notofficationSound)
audio.currentTime = 0
audio.volume = 0.3

const playAudio = async () => {
  try {
    await audio.play()
  } catch (error) {}
}

const store: StateCreator<ChatSchema> = (set, get) => ({
  messages: [],

  addMessage(message) {
    playAudio()

    set((state) => ({ ...state, messages: [...state.messages, message] }))
  },
})

export const useChatStore = create(store)
