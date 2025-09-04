import { useEffect, useState } from 'react'

import type { GameEngine } from '../model/GameEngine/GameEngine'

export const useGameEngine = <T extends GameEngine>(gameEngine: T) => {
  const [, setUpdate] = useState(0)

  useEffect(() => {
    const updateFn = () => {
      setUpdate((prev) => prev + 1)
    }

    gameEngine.on('update', updateFn)

    return () => {
      gameEngine.off('update', updateFn)
    }
  }, [gameEngine])

  return gameEngine
}
