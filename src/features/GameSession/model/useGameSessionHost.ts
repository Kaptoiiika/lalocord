import { useEffect, useRef } from 'react'

import { IpcChannels } from 'electron/main/types/ipcChannels'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'
import { isRemoteControlEvent } from 'src/shared/types/ClientEvents'
import { isGameSessionOffer } from 'src/shared/types/GameSession'

import type { WebRTCClient } from 'src/entities/WebRTC'
import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { useHostSessionStore } from './hostSessionStore'
import { toGameCaptureSettings } from '../lib/captureSettings'
import { GAME_CHANNEL_BUFFER_LIMIT, isGameVideoKey, splitGamePacket } from '../lib/gameChannelPacket'

type GameRelay = {
  subscribers: Map<string, WebRTCClient>
  controllerId: string | null
  packetId: number
  lastKey: Uint8Array | null
}

const createGameRelay = (): GameRelay => ({
  subscribers: new Map(),
  controllerId: null,
  packetId: 1,
  lastKey: null,
})

const reportGameRelay = (relay: GameRelay) => {
  window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionRelay, relay.subscribers.size)
}

const nextPacketId = (relay: GameRelay) => {
  const packetId = relay.packetId
  relay.packetId = packetId === 0xffffffff ? 1 : packetId + 1

  return packetId
}

const sendGamePacketToPeer = (peer: WebRTCClient, packet: Uint8Array, parts: Uint8Array[]) => {
  const isSkippableVideo = packet.byteLength >= 6 && packet[0] === 2 && packet[5] !== 1
  if (isSkippableVideo && peer.gameChannelBufferedAmount() > GAME_CHANNEL_BUFFER_LIMIT) return

  parts.forEach((part) => {
    peer.sendGameChannel(part)
  })
}

const fanoutGamePacket = (relay: GameRelay, packet: Uint8Array) => {
  if (isGameVideoKey(packet)) relay.lastKey = packet

  const parts = splitGamePacket(nextPacketId(relay), packet)
  relay.subscribers.forEach((peer) => {
    sendGamePacketToPeer(peer, packet, parts)
  })
}

const rememberGameController = (relay: GameRelay) => {
  if (relay.controllerId && relay.subscribers.has(relay.controllerId)) return

  const next = relay.subscribers.keys().next()
  relay.controllerId = next.done ? null : next.value
}

const acceptGameHello = (relay: GameRelay, peer: WebRTCClient) => {
  const isNew = !relay.subscribers.has(peer.id)
  relay.subscribers.set(peer.id, peer)
  if (!relay.controllerId) relay.controllerId = peer.id
  if (!isNew) return

  if (relay.lastKey) sendGamePacketToPeer(peer, relay.lastKey, splitGamePacket(nextPacketId(relay), relay.lastKey))
  reportGameRelay(relay)
}

const removeGameSubscriber = (relay: GameRelay, peerId: string) => {
  if (!relay.subscribers.has(peerId)) return

  const wasController = relay.controllerId === peerId
  relay.subscribers.delete(peerId)
  rememberGameController(relay)
  reportGameRelay(relay)
  if (!wasController || !window.electron) return

  window.electron.ipcRenderer.sendMessage(IpcChannels.gameSessionInput, { type: 'release' })
}

const isGameHello = (value: unknown, token: string) => {
  if (typeof value !== 'object' || value === null) return false

  const hello = value as { type?: unknown; token?: unknown }

  return hello.type === 'hello' && hello.token === token
}

const handleGameChannelMessage = (relay: GameRelay, peer: WebRTCClient, data: string | ArrayBuffer, token: string | undefined) => {
  if (typeof data !== 'string' || !token) return

  let parsed: unknown
  try {
    parsed = JSON.parse(data)
  } catch (error) {
    console.error(error)
    return
  }

  if (isGameHello(parsed, token)) {
    acceptGameHello(relay, peer)
    return
  }

  if (peer.id !== relay.controllerId || !isRemoteControlEvent(parsed) || !window.electron) return

  window.electron.ipcRenderer.sendMessage(IpcChannels.gameSessionInput, parsed)
}

const copyGamePacket = (payload: Uint8Array) => {
  if (!(payload instanceof Uint8Array) || payload.byteLength < 5) return null

  return new Uint8Array(payload)
}

export const useGameSessionHost = () => {
  const users = useWebRTCRoomStore((state) => state.users)
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const bitrate = useWebRTCStore((state) => state.bitrate)
  const screenStream = useWebRTCStore((state) => state.streams.screen)
  const offerRef = useRef<GameSessionOffer | null>(null)
  const relayRef = useRef(createGameRelay())

  useEffect(() => {
    if (!window.electron) return

    const publish = (offer: GameSessionOffer | null) => {
      useWebRTCRoomStore.getState().users.forEach(({ peer }) => {
        peer.setGameSession(offer)
      })
    }

    const clearRelay = () => {
      relayRef.current.subscribers.clear()
      relayRef.current.controllerId = null
      relayRef.current.lastKey = null
      reportGameRelay(relayRef.current)
    }

    const handleReady = (offer: GameSessionOffer) => {
      if (!isGameSessionOffer(offer)) return
      offerRef.current = offer
      useHostSessionStore.getState().setHostOffer(offer)
      useWebRTCStore.getState().holdGameScreenTile()
      publish(offer)
    }

    const handleEnded = () => {
      offerRef.current = null
      useHostSessionStore.getState().setHostOffer(null)
      useWebRTCStore.getState().releaseGameScreenTile()
      clearRelay()
      publish(null)
    }

    const handleFailed = (message: string) => {
      offerRef.current = null
      useHostSessionStore.getState().setHostOffer(null)
      useWebRTCStore.getState().releaseGameScreenTile()
      clearRelay()
      window.alert(message)
    }

    const unsubscribeReady = window.electron.ipcRenderer.on(IpcChannels.gameSessionReady, handleReady)
    const unsubscribeEnded = window.electron.ipcRenderer.on(IpcChannels.gameSessionEnded, handleEnded)
    const unsubscribeFailed = window.electron.ipcRenderer.on(IpcChannels.gameSessionFailed, handleFailed)

    return () => {
      unsubscribeReady()
      unsubscribeEnded()
      unsubscribeFailed()
      useHostSessionStore.getState().setHostOffer(null)
      clearRelay()
      if (!offerRef.current) return
      window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionStop, undefined)
    }
  }, [])

  useEffect(() => {
    if (!window.electron) return

    const relay = relayRef.current
    const unsubscribe = window.electron.ipcRenderer.on(IpcChannels.gameSessionPacket, (payload) => {
      if (!offerRef.current) return

      const packet = copyGamePacket(payload)
      if (!packet) return

      fanoutGamePacket(relay, packet)
    })
    const timer = window.setInterval(() => {
      let maxAmount = 0
      relay.subscribers.forEach((peer) => {
        maxAmount = Math.max(maxAmount, peer.gameChannelBufferedAmount())
      })
      window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionCongestion, maxAmount)
    }, 500)

    return () => {
      unsubscribe()
      window.clearInterval(timer)
      relay.subscribers.clear()
      relay.controllerId = null
      window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionRelay, 0)
    }
  }, [])

  useEffect(() => {
    if (!window.electron) return

    window.electron.ipcRenderer.sendMessage(IpcChannels.gameSessionConfigure, toGameCaptureSettings(streamConstraints, bitrate))
  }, [bitrate, streamConstraints])

  useEffect(() => {
    const offer = offerRef.current
    if (!offer) return

    users.forEach(({ peer }) => {
      peer.setGameSession(offer)
    })
  }, [users])

  useEffect(() => {
    if (!window.electron) return

    const relay = relayRef.current
    const present = new Set(users.map(({ peer }) => peer.id))
    const removed: string[] = []
    relay.subscribers.forEach((_peer, id) => {
      if (!present.has(id)) removed.push(id)
    })
    removed.forEach((id) => {
      removeGameSubscriber(relay, id)
    })

    const detach: Array<() => void> = []
    users.forEach(({ peer }) => {
      if (relay.subscribers.has(peer.id)) relay.subscribers.set(peer.id, peer)

      const onMessage = (data: string | ArrayBuffer) => {
        handleGameChannelMessage(relay, peer, data, offerRef.current?.token)
      }
      const onClose = () => {
        removeGameSubscriber(relay, peer.id)
      }
      peer.on('onGameChannel', onMessage)
      peer.on('onGameChannelClose', onClose)
      detach.push(() => {
        peer.off('onGameChannel', onMessage)
        peer.off('onGameChannelClose', onClose)
      })
    })
    reportGameRelay(relay)

    return () => {
      detach.forEach((stop) => {
        stop()
      })
    }
  }, [users])

  useEffect(() => {
    if (screenStream || !offerRef.current || !window.electron) return

    // The screen tile is the session window. Stopping the broadcast ends the session.
    offerRef.current = null
    relayRef.current.subscribers.clear()
    relayRef.current.controllerId = null
    relayRef.current.lastKey = null
    useHostSessionStore.getState().setHostOffer(null)
    window.electron.ipcRenderer.sendMessage(IpcChannels.gameSessionRelay, 0)
    window.electron.ipcRenderer.sendMessage(IpcChannels.gameSessionStop, undefined)
  }, [screenStream])
}
