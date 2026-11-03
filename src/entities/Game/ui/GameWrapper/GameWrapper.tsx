import type { PropsWithChildren } from 'react'
import { useCallback, useEffect } from 'react'

import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { cn } from 'src/shared/lib/utils/cn'
import { Button } from 'src/shared/ui'

import type { GameEngine } from '../../model/GameEngine/GameEngine'

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
      className={cn('relative', className)}
    >
      <Button onClick={handleCloseGame}>close</Button>
      {children}
    </div>
  )
}
