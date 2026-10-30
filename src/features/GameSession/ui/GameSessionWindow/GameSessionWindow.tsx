import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@mui/material'

import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { GameSessionPlayback } from './GameSessionPlayback'

import styles from './GameSessionWindow.module.scss'

type GameSessionWindowProps = {
  isHost: boolean
  offer: GameSessionOffer | null
}

export const GameSessionWindow = (props: GameSessionWindowProps) => {
  const { isHost, offer } = props
  const [isPlaybackOpen, setIsPlaybackOpen] = useState(false)
  const [isControlEnabled, setIsControlEnabled] = useState(false)
  const [errorText, setErrorText] = useState('')
  const offerKey = offer ? `${offer.url}\u0000${offer.token}` : ''
  const offerKeyRef = useRef(offerKey)
  const audioContextRef = useRef<AudioContext | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const isFullscreenOpenRef = useRef(false)

  const leavePlayback = useCallback(() => {
    isFullscreenOpenRef.current = false
    setIsControlEnabled(false)
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
        return
      }
      if (!isFullscreenOpenRef.current) return

      isFullscreenOpenRef.current = false
      setIsControlEnabled(false)
      setIsPlaybackOpen(false)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

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
        audioContext={audioContextRef.current}
        isControlEnabled={isControlEnabled}
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
