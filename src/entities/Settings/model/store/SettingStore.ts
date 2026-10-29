import { IpcChannels } from 'electron/main/types/ipcChannels'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { StateCreator } from 'zustand'

export interface SettingSchema {
  allowDrawLine: boolean
  overlayDrawEnabled: boolean
  allowRemoteControl: boolean

  setAllowDrawLine: (allow: boolean) => void
  setOverlayDrawEnabled: (enabled: boolean) => void
  setAllowRemoteControl: (allow: boolean) => void
}

const store: StateCreator<SettingSchema> = (set) => ({
  allowDrawLine: true,
  overlayDrawEnabled: false,
  allowRemoteControl: false,

  setAllowDrawLine(allow) {
    set((state) => ({
      ...state,
      allowDrawLine: allow,
    }))
  },
  setOverlayDrawEnabled(enabled) {
    if (!enabled && __IS_ELECTRON__) {
      window.electron?.ipcRenderer.sendMessage(IpcChannels.closeOverlay, undefined)
    }
    set((state) => ({
      ...state,
      overlayDrawEnabled: enabled,
    }))
  },
  setAllowRemoteControl(allow) {
    set((state) => ({
      ...state,
      allowRemoteControl: allow,
    }))
  },
})

export const useSettingStore = create(
  persist(store, {
    name: localstorageKeys.SETTINGS,
    storage: createJSONStorage(() => localStorage),
  })
)

