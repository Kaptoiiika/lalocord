import { create, StateCreator } from "zustand"
import {
  AudioEffectSchema,
  AudioName,
  AudioSettingsList,
} from "../types/AudioEffectSchema"
import { persist } from "zustand/middleware"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import notificationSound from "@/shared/assets/audio/notification.mp3"
import joinToRoomSound from "@/shared/assets/audio/joinToRoom.mp3"
import exitFromRoomSound from "@/shared/assets/audio/exitFromRoom.mp3"
import { clamp } from "@/shared/lib/utils/Numbers"

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
  audioSettings: Object.entries(AudioInstance).reduce<AudioSettingsList>(
    (prev, [name, audio]) => {
      prev[name] = { volume: audio.volume, muted: audio.muted }
      return prev
    },
    {}
  ),
  usersAuidoSettings: {},

  play(audioName) {
    const state = get()
    AudioInstance[audioName].currentTime = 0
    AudioInstance[audioName].volume = state.audioSettings[audioName].volume ?? 1
    AudioInstance[audioName].muted =
      state.audioSettings[audioName].muted ?? false
    return AudioInstance[audioName].play()
  },

  changeVolume(audioName, volume = 0) {
    const clampedValue = clamp(volume, 0, 1)
    set((state) => ({
      ...state,
      audioSettings: {
        ...state.audioSettings,
        [audioName]: { volume: clampedValue },
      },
    }))
  },

  changeUserVolume(username, type, volume) {
    set((state) => ({
      ...state,
      usersAuidoSettings: {
        ...state.usersAuidoSettings,
        [username]: { ...state.usersAuidoSettings[username], [type]: volume },
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
