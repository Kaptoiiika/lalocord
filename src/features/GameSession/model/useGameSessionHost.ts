import { useEffect, useRef } from 'react'

import { IpcChannels } from 'electron/main/types/ipcChannels'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'
import { isGameSessionOffer } from 'src/shared/types/GameSession'

import type { GameSessionOffer } from 'src/shared/types/GameSession'

export const useGameSessionHost = () => {
  const users = useWebRTCRoomStore((state) => state.users)
  const offerRef = useRef<GameSessionOffer | null>(null)

  useEffect(() => {
    if (!window.electron) return

    const publish = (offer: GameSessionOffer | null) => {
      useWebRTCRoomStore.getState().users.forEach(({ peer }) => {
        peer.setGameSession(offer)
      })
    }

    const handleReady = (offer: GameSessionOffer) => {
      if (!isGameSessionOffer(offer)) return
      offerRef.current = offer
      useWebRTCStore.getState().holdGameScreenTile()
      publish(offer)
    }

    const handleEnded = () => {
      offerRef.current = null
      useWebRTCStore.getState().releaseGameScreenTile()
      publish(null)
    }

    const handleFailed = (message: string) => {
      offerRef.current = null
      useWebRTCStore.getState().releaseGameScreenTile()
      window.alert(message)
    }

    const unsubscribeReady = window.electron.ipcRenderer.on(IpcChannels.gameSessionReady, handleReady)
    const unsubscribeEnded = window.electron.ipcRenderer.on(IpcChannels.gameSessionEnded, handleEnded)
    const unsubscribeFailed = window.electron.ipcRenderer.on(IpcChannels.gameSessionFailed, handleFailed)

    return () => {
      unsubscribeReady()
      unsubscribeEnded()
      unsubscribeFailed()
      if (!offerRef.current) return
      window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionStop, undefined)
    }
  }, [])

  useEffect(() => {
    const offer = offerRef.current
    if (!offer) return

    users.forEach(({ peer }) => {
      peer.setGameSession(offer)
    })
  }, [users])
}
