import { create, StateCreator } from "zustand"
import { ChatSchema } from "../types/ChatSchema"
import { useAudioEffectStore } from "@/entities/AudioEffect"
import { AudioName } from "@/entities/AudioEffect/model/types/AudioEffectSchema"

const store: StateCreator<ChatSchema> = (set, get) => ({
  messages: [],
  addMessage(message, silent = false) {
    if (!silent) useAudioEffectStore.getState().play(AudioName.notification)
    set((state) => ({ ...state, messages: [...state.messages, message] }))
  },
})

export const useChatStore = create(store)
