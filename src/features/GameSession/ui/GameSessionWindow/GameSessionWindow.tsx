import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'

import type { WebRTCClient } from 'src/entities/WebRTC'
import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { GameSessionPlayback } from './GameSessionPlayback'

import styles from './GameSessionWindow.module.scss'

type GameSessionWindowProps = {
  isHost: boolean
  offer: GameSessionOffer | null
  peer?: WebRTCClient | null
}

export const GameSessionWindow = (props: GameSessionWindowProps) => {
  const { isHost, offer, peer = null } = props
  const [isPlaybackOpen, setIsPlaybackOpen] = useState(false)
  const [isControlEnabled, setIsControlEnabled] = useState(false)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const [errorText, setErrorText] = useState('')
  const offerKey = offer ? `${offer.url}\u0000${offer.token}` : ''
  const offerKeyRef = useRef(offerKey)
  const audioContextRef = useRef<AudioContext | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const isFullscreenOpenRef = useRef(false)

  const requestGamePointerLock = useCallback(() => {
    const surface = surfaceRef.current
    if (!surface || document.pointerLockElement === surface) return

    try {
      const lockResult = surface.requestPointerLock()
      void Promise.resolve(lockResult).catch((error: unknown) => {
        console.error(error)
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  const leavePlayback = useCallback(() => {
    isFullscreenOpenRef.current = false
    setIsControlEnabled(false)
    setIsPointerLocked(false)
    if (document.pointerLockElement === surfaceRef.current) document.exitPointerLock()
    if (document.fullscreenElement !== surfaceRef.current) return

    document.exitFullscreen().catch((error: unknown) => {
      console.error(error)
    })
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isSurfaceFullscreen = document.fullscreenElement === surfaceRef.current
      if (isSurfaceFullscreen) {
        isFullscreenOpenRef.current = true
        setIsControlEnabled(true)
        requestGamePointerLock()
        return
      }
      if (!isFullscreenOpenRef.current) return

      isFullscreenOpenRef.current = false
      setIsControlEnabled(false)
      setIsPlaybackOpen(false)
      if (document.pointerLockElement === surfaceRef.current) document.exitPointerLock()
    }
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === surfaceRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
    }
  }, [requestGamePointerLock])

  useEffect(() => {
    if (offerKeyRef.current === offerKey) return

    offerKeyRef.current = offerKey
    setIsPlaybackOpen(false)
    setErrorText('')
    leavePlayback()
  }, [leavePlayback, offerKey])

  const handleConnect = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!offer) return

    let playbackContext = audioContextRef.current
    if (!playbackContext || playbackContext.state === 'closed') {
      try {
        playbackContext = new AudioContext({ sampleRate: 48000, latencyHint: 'interactive' })
      } catch (error) {
        console.error(error)
        setErrorText('Failed to connect')
        return
      }
      audioContextRef.current = playbackContext
    }
    void playbackContext.resume()
    setErrorText('')
    setIsControlEnabled(false)
    setIsPlaybackOpen(true)
    requestGamePointerLock()
    const surface = surfaceRef.current
    if (!surface || document.fullscreenElement === surface) {
      isFullscreenOpenRef.current = document.fullscreenElement === surface
      setIsControlEnabled(true)
      return
    }
    surface.requestFullscreen().catch((error: unknown) => {
      console.error(error)
      setIsControlEnabled(true)
    })
  }

  if (isHost) {
    return (
      <div className={styles.hostPlaque}>
        <p className={styles.text}>Game mode</p>
        <p className={styles.note}>You are host</p>
      </div>
    )
  }

  if (!offer) return null

  let viewerContent = (
    <div className={styles.viewerPlaque}>
      <p className={styles.text}>Game mode</p>
      <Button
        className={styles.connect}
        variant="contained"
        type="button"
        onMouseDown={(event) => {
          event.stopPropagation()
        }}
        onClick={handleConnect}
      >
        join
      </Button>
      {errorText ? <p className={styles.error}>{errorText}</p> : null}
    </div>
  )
  if (isPlaybackOpen && audioContextRef.current) {
    viewerContent = (
      <GameSessionPlayback
        offer={offer}
        peer={peer}
        audioContext={audioContextRef.current}
        isControlEnabled={isControlEnabled}
        isRelativePointer={isPointerLocked}
        onExit={() => {
          leavePlayback()
          setIsPlaybackOpen(false)
        }}
        onFailed={() => {
          leavePlayback()
          setIsPlaybackOpen(false)
          setErrorText('Failed to connect')
        }}
      />
    )
  }

  return (
    <div
      ref={surfaceRef}
      className={styles.viewerSurface}
    >
      {viewerContent}
    </div>
  )
}
