import type { PropsWithChildren } from 'react'
import { useCallback, useEffect } from 'react'

import { Button } from '@mui/material'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { classNames } from 'src/shared/lib/classNames/classNames'

import type { GameEngine } from '../../model/GameEngine/GameEngine'

import styles from './GameWrapper.module.scss'

type GameWrapperProps = PropsWithChildren & {
  gameEngine: GameEngine
  className?: string
}

export const GameWrapper = (props: GameWrapperProps) => {
  const { children, gameEngine, className } = props

  useEffect(() => {
    const removeMiniGameFn = () => {
      useWebRTCRoomStore.getState().removeMiniGame(gameEngine.id)
    }

    gameEngine.on('onClose', removeMiniGameFn)

    return () => {
      gameEngine.off('onClose', removeMiniGameFn)
    }
  }, [gameEngine])

  const handleCloseGame = useCallback(() => {
    gameEngine.closeEngine()
  }, [gameEngine])

  return (
    <div
      inert={gameEngine.isClosed}
      className={classNames(styles.root, className)}
    >
      <Button
        variant="contained"
        onClick={handleCloseGame}
      >
        close
      </Button>
      {children}
    </div>
  )
}
