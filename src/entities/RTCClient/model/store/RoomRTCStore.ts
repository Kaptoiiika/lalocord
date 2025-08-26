import { create } from 'zustand'

import type { RoomRTCSchema } from '../../../../entities/RTCClient/model/types/RoomRTCSchema'
import type { StateCreator } from 'zustand'

import {
  getEncodingSettingsFromLocalStorage,
  getStreamSettingsfromLocalStorage,
  saveEncodingSettingsToLocalStorage,
} from './RoomRTCLocalStorage'
import { ConvertUserSettingsToMediaSettings } from '../../utils/ConvertUserSettingsToMediaSettings'

const store: StateCreator<RoomRTCSchema> = (set) => ({
  streamSettings: ConvertUserSettingsToMediaSettings(getStreamSettingsfromLocalStorage()),
  userStreamSettings: getStreamSettingsfromLocalStorage(),
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
