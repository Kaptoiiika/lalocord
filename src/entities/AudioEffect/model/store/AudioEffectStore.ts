import { create, StateCreator } from "zustand"
import { AudioEffectSchema, AudioName } from "../types/AudioEffectSchema"
import { persist } from "zustand/middleware"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import notificationSound from "@/shared/assets/audio/notification.mp3"
import joinToRoomSound from "@/shared/assets/audio/joinToRoom.mp3"
import exitFromRoomSound from "@/shared/assets/audio/exitFromRoom.mp3"

type AudioSrc = string
const AudioSourceList: [AudioName, AudioSrc][] = [
  [AudioName.notification, notificationSound],
  [AudioName.joinToRoom, joinToRoomSound],
  [AudioName.exitFromRoom, exitFromRoomSound],
]

const AudioInstance = AudioSourceList.reduce<Record<string, HTMLAudioElement>>(
  (prev, [name, src]) => {
    const audio = new Audio(src)
    prev[name] = audio
    return prev
  },
  {}
)

const store: StateCreator<AudioEffectSchema> = (set, get) => ({
  audioSettings: {
    [AudioName.notification]: {
      muted: AudioInstance[AudioName.notification].muted,
      volume: AudioInstance[AudioName.notification].volume,
    },
    [AudioName.joinToRoom]: {
      muted: AudioInstance[AudioName.joinToRoom].muted,
      volume: AudioInstance[AudioName.joinToRoom].volume,
    },
    [AudioName.exitFromRoom]: {
      muted: AudioInstance[AudioName.exitFromRoom].muted,
      volume: AudioInstance[AudioName.exitFromRoom].volume,
    },
  },

  play(audioName) {
    const state = get()
    AudioInstance[audioName].currentTime = 0
    AudioInstance[audioName].volume = state.audioSettings[audioName].volume
    AudioInstance[audioName].muted = state.audioSettings[audioName].muted
    return AudioInstance[audioName].play()
  },

  changeVolume(audioName, volume = 0) {
    const clampedValue = Math.max(1, Math.min(0, volume))
    set((state) => ({
      ...state,
      audioSettings: {
        ...state.audioSettings,
        [audioName]: { volume: clampedValue },
      },
    }))
  },
  changeMuted(audioName, muted) {
    set((state) => ({
      ...state,
      audioSettings: {
        ...state.audioSettings,
        [audioName]: {
          volume: state.audioSettings[audioName].volume,
          muted: muted,
        },
      },
    }))
  },
})

export const useAudioEffectStore = create(
  persist(store, { name: localstorageKeys.AUDIO })
)
