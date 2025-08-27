import { create } from 'zustand'

import type { RoomRTCSchema } from '../types/RoomRTCSchema'
import type { StateCreator } from 'zustand'

import {
  getEncodingSettingsFromLocalStorage,
  saveEncodingSettingsToLocalStorage,
} from './RoomRTCLocalStorage'
import { ConvertUserSettingsToMediaSettings } from '../../utils/ConvertUserSettingsToMediaSettings'

const store: StateCreator<RoomRTCSchema> = (set) => ({
  streamSettings: {},
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
  setStreamSettings(streamSettings) {
    set((state) => ({
      ...state,
      streamSettings: ConvertUserSettingsToMediaSettings(streamSettings),
    }))
  },
})

export const useRoomRTCStore = create(store)
