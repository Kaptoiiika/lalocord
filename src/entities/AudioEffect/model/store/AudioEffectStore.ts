import exitFromRoomSound from 'src/shared/assets/audio/exitFromRoom.mp3'
import joinToRoomSound from 'src/shared/assets/audio/joinToRoom.mp3'
import notificationSound from 'src/shared/assets/audio/notification.mp3'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { clamp } from 'src/shared/lib/utils/Numbers'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AudioEffectSchema, AudioSettingsList } from '../types/AudioEffectSchema'
import type { StateCreator } from 'zustand'

import { AudioName } from '../types/AudioEffectSchema'

type AudioSrc = string
const AudioSourceList: [AudioName, AudioSrc][] = [
  [AudioName.notification, notificationSound],
  [AudioName.joinToRoom, joinToRoomSound],
  [AudioName.exitFromRoom, exitFromRoomSound],
]

const AudioInstance = AudioSourceList.reduce<Record<string, HTMLAudioElement>>((prev, [name, src]) => {
  const audio = new Audio(src)

  prev[name] = audio

  return prev
}, {})

const store: StateCreator<AudioEffectSchema> = (set, get) => ({
  audioSettings: Object.entries(AudioInstance).reduce<AudioSettingsList>((prev, [name, audio]) => {
    prev[name] = {
      volume: audio.volume,
      muted: audio.muted,
    }

    return prev
  }, {}),
  usersAuidoSettings: {},

  play(audioName) {
    const state = get()

    AudioInstance[audioName].currentTime = 0
    AudioInstance[audioName].volume = state.audioSettings[audioName].volume ?? 1
    AudioInstance[audioName].muted = state.audioSettings[audioName].muted ?? false

    return AudioInstance[audioName].play()
  },

  changeVolume(audioName, volume = 0) {
    const clampedValue = clamp(volume, 0, 1)

    set((state) => ({
      ...state,
      audioSettings: {
        ...state.audioSettings,
        [audioName]: {
          volume: clampedValue,
        },
      },
    }))
  },

  changeUserVolume(username, type, volume) {
    set((state) => ({
      ...state,
      usersAuidoSettings: {
        ...state.usersAuidoSettings,
        [username]: {
          ...state.usersAuidoSettings[username],
          [type]: volume,
        },
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
          muted,
        },
      },
    }))
  },
})

export const useAudioEffectStore = create(
  persist(store, {
    name: localstorageKeys.AUDIO,
  })
)
