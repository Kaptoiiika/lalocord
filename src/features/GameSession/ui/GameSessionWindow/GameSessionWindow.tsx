import { useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'

import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { useHostSessionStore } from '../../model/hostSessionStore'

import styles from './GameSessionWindow.module.scss'

const readPackets = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
  let pending = new Uint8Array(0)

  while (true) {
    const next = await reader.read()
    if (next.done) return

    const combined = new Uint8Array(pending.length + next.value.length)
    combined.set(pending)
    combined.set(next.value, pending.length)
    pending = combined

    while (pending.length >= 5) {
      const view = new DataView(pending.buffer, pending.byteOffset, pending.byteLength)
      const length = view.getUint32(1)
      if (pending.length < 5 + length) break

      pending = pending.slice(5 + length)
    }
  }
}

const connectToSession = async (offer: GameSessionOffer) => {
  const hash = Uint8Array.from(atob(offer.certHash), (char) => char.charCodeAt(0))
  const transport = new WebTransport(offer.url, {
    serverCertificateHashes: [{ algorithm: 'sha-256', value: hash }],
  })
  await transport.ready

  const writer = transport.datagrams.writable.getWriter()
  await writer.write(new TextEncoder().encode(JSON.stringify({ type: 'hello', token: offer.token })))

  const incoming = transport.incomingUnidirectionalStreams.getReader()
  const stream = await incoming.read()
  if (!stream.done && stream.value) {
    void readPackets(stream.value.getReader()).catch((error: unknown) => {
      console.error(error)
    })
  }

  return transport
}

export const GameSessionWindow = () => {
  const hostOffer = useHostSessionStore((state) => state.hostOffer)
  const users = useWebRTCRoomStore((state) => state.users)
  const [viewerOffer, setViewerOffer] = useState<GameSessionOffer | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [errorText, setErrorText] = useState('')
  const transportRef = useRef<WebTransport | null>(null)
  const offerKeyRef = useRef('')
  const connectGenerationRef = useRef(0)
  const isHost = Boolean(hostOffer)

  useEffect(() => {
    const syncOffer = () => {
      const hostToken = useHostSessionStore.getState().hostOffer?.token
      const matched = users
        .map((user) => user.peer.gameSessionOffer)
        .find((offer) => offer !== null && offer.token !== hostToken)

      setViewerOffer(matched ?? null)
    }

    syncOffer()
    users.forEach(({ peer }) => {
      peer.on('onGameSession', syncOffer)
    })

    return () => {
      users.forEach(({ peer }) => {
        peer.off('onGameSession', syncOffer)
      })
    }
  }, [users, hostOffer])

  useEffect(() => {
    const offerKey = viewerOffer ? `${viewerOffer.url}\u0000${viewerOffer.token}` : ''
    if (offerKeyRef.current === offerKey) return

    offerKeyRef.current = offerKey
    connectGenerationRef.current += 1
    transportRef.current?.close()
    transportRef.current = null
    setIsConnected(false)
    setErrorText('')
  }, [viewerOffer])

  useEffect(
    () => () => {
      connectGenerationRef.current += 1
      transportRef.current?.close()
    },
    []
  )

  const handleConnect = () => {
    if (!viewerOffer || isConnected) return

    const generation = connectGenerationRef.current + 1
    connectGenerationRef.current = generation
    setErrorText('')
    connectToSession(viewerOffer)
      .then((transport) => {
        if (connectGenerationRef.current !== generation) {
          transport.close()
          return
        }

        transportRef.current?.close()
        transportRef.current = transport
        setIsConnected(true)
      })
      .catch((error: unknown) => {
        console.error(error)
        if (connectGenerationRef.current !== generation) return

        setErrorText('Не удалось подключиться')
      })
  }

  if (!isHost && !viewerOffer) return null

  return (
    <div className={styles.window}>
      <p className={styles.text}>Игровая сессия</p>
      {isHost ? <p className={styles.note}>Вы хост</p> : null}
      {!isHost && (
        <Button
          className={styles.connect}
          variant="contained"
          disabled={isConnected}
          onClick={handleConnect}
        >
          Подключиться
        </Button>
      )}
      {!isHost && errorText ? <p className={styles.error}>{errorText}</p> : null}
    </div>
  )
}
