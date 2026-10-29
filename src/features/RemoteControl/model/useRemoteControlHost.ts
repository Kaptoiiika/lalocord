import { useEffect } from 'react'

import { IpcChannels } from 'electron/main/types/ipcChannels'
import { useSettingStore } from 'src/entities/Settings'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'

import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'

import { getRemoteControlScreenBounds } from '../lib/getRemoteControlScreenBounds'

export const useRemoteControlHost = () => {
  const allowRemoteControl = useSettingStore((state) => state.allowRemoteControl)
  const screenStream = useWebRTCStore((state) => state.streams.screen)
  const users = useWebRTCRoomStore((state) => state.users)

  useEffect(() => {
    const bounds = getRemoteControlScreenBounds(allowRemoteControl, screenStream)
    const isEnabled = Boolean(bounds)

    users.forEach(({ peer }) => {
      peer.setRemoteControlEnabled(isEnabled)
    })

    if (!window.electron) return

    if (bounds) {
      window.electron.ipcRenderer.sendMessage(IpcChannels.remoteControlStart, { bounds })
      return
    }

    window.electron.ipcRenderer.sendMessage(IpcChannels.remoteControlStop, undefined)
  }, [allowRemoteControl, screenStream, users])

  useEffect(() => {
    const handleControlEvent = (event: RemoteControlEvent) => {
      const liveBounds = getRemoteControlScreenBounds(
        useSettingStore.getState().allowRemoteControl,
        useWebRTCStore.getState().streams.screen
      )
      if (!liveBounds || !window.electron) return

      window.electron.ipcRenderer.sendMessage(IpcChannels.remoteControlInput, event)
    }

    users.forEach(({ peer }) => {
      peer.on('onControlEvent', handleControlEvent)
    })

    return () => {
      users.forEach(({ peer }) => {
        peer.off('onControlEvent', handleControlEvent)
      })
    }
  }, [users])

  useEffect(
    () => () => {
      window.electron?.ipcRenderer.sendMessage(IpcChannels.remoteControlStop, undefined)
    },
    []
  )
}
