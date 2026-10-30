import type { MouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

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
  const [errorText, setErrorText] = useState('')
  const offerKey = offer ? `${offer.url}\u0000${offer.token}` : ''
  const offerKeyRef = useRef(offerKey)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (offerKeyRef.current === offerKey) return

    offerKeyRef.current = offerKey
    setIsPlaybackOpen(false)
    setErrorText('')
  }, [offerKey])

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
        setErrorText('Не удалось подключиться')
        return
      }
      audioContextRef.current = playbackContext
    }
    void playbackContext.resume()
    setErrorText('')
    setIsPlaybackOpen(true)
  }

  if (isHost) {
    return (
      <div className={styles.hostPlaque}>
        <p className={styles.text}>Игровая сессия</p>
        <p className={styles.note}>Вы хост</p>
      </div>
    )
  }

  if (!offer) return null

  if (isPlaybackOpen && audioContextRef.current) {
    return (
      <GameSessionPlayback
        offer={offer}
        audioContext={audioContextRef.current}
        onExit={() => {
          setIsPlaybackOpen(false)
        }}
        onFailed={() => {
          setIsPlaybackOpen(false)
          setErrorText('Не удалось подключиться')
        }}
      />
    )
  }

  return (
    <div className={styles.viewerSurface}>
      <div className={styles.viewerPlaque}>
        <p className={styles.text}>Игровая сессия</p>
        <Button
          className={styles.connect}
          variant="contained"
          type="button"
          onMouseDown={(event) => {
            event.stopPropagation()
          }}
          onClick={handleConnect}
        >
          Подключиться
        </Button>
        {errorText ? <p className={styles.error}>{errorText}</p> : null}
      </div>
    </div>
  )
}
