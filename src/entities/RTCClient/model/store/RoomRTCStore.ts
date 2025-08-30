import { create } from 'zustand'

import type { RoomRTCSchema } from '../types/RoomRTCSchema'
import type { StateCreator } from 'zustand'

import {
  getEncodingSettingsFromLocalStorage,
  saveEncodingSettingsToLocalStorage,
} from './RoomRTCLocalStorage'

const store: StateCreator<RoomRTCSchema> = (set) => ({
  encodingSettings: getEncodingSettingsFromLocalStorage(),

  setEncodingSettings: (settings) => {
    saveEncodingSettingsToLocalStorage(settings)
    set((state) => ({
      ...state,
      encodingSettings: {
        ...settings,
      },
    }))
  },
})

export const useRoomRTCStore = create(store)
