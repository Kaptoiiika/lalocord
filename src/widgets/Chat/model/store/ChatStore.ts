import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"
import notofficationSound from "@/shared/assets/audio/notification.mp3"
import {
  getChatAudioFromLocalStorage,
  saveChatAudioToLocalStorage,
} from "./ChatStoreLocalStorage"

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
  silent: getChatAudioFromLocalStorage(),

  addMessage(message, silent = false) {
    const storeSilent = get().silent
    if (!silent && !storeSilent) playAudio()

    set((state) => ({ ...state, messages: [...state.messages, message] }))
  },

  changeSilentMode(silent) {
    saveChatAudioToLocalStorage({ silent })

    set((state) => ({ ...state, silent: silent }))
  },
})

export const useChatStore = create(store)
