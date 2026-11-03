import { useCallback, useMemo, useState } from 'react'

import { GameWrapper, useGameEngine } from 'src/entities/Game'
import { Button } from 'src/shared/ui'

import type { WebRTCClient } from 'src/entities/WebRTC'

import { TicTacToeBoard } from './TicTacToe/TicTacToeBoard/TicTacToeBoard'
import { TicTacToeGame } from '../model/lib/TicTacToeGame'
import { TicTacToeContext } from '../model/store/TicTacToeContext'
import { TicTacToePlayer } from '../model/types/TicTacToe'

const createLocalGame = () =>
  new TicTacToeGame({
    id: '0',
    isCross: true,
    peer: {
      channelMiniGame: {
        channel: {
          addEventListener: () => {},
          removeEventListener: () => {},
          send: () => {},
        },
      },
    } as unknown as WebRTCClient,
  })

export const TicTacToe = () => {
  const [game, setGame] = useState<TicTacToeGame>(createLocalGame)
  const board = game?.board
  const currentPlayer = game?.currentPlayer
  useGameEngine(game)

  const handleCeilClick = (fieldId: number, ceilId: number) => {
    game?.sendMove?.(fieldId, ceilId)
    game?.changeCurrentPlayer?.(currentPlayer === TicTacToePlayer.O ? TicTacToePlayer.X : TicTacToePlayer.O)
  }

  const handleRestartGame = () => {
    setGame(createLocalGame())
  }

  return (
    <TicTacToeContext.Provider value={{ game, onMove: handleCeilClick }}>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="mb-2.5 flex items-center gap-2.5">
          <Button onClick={handleRestartGame}>restart</Button>
          <h2 className="text-2xl font-semibold">Turn: {currentPlayer}</h2>
        </div>
        {board ? <TicTacToeBoard /> : null}
      </div>
    </TicTacToeContext.Provider>
  )
}

type TicTacToeMultiplayerProps = {
  game: TicTacToeGame
}

export const TicTacToeMultiplayer = (props: TicTacToeMultiplayerProps) => {
  const { game } = props
  const { isClosed, board, activePlayer, currentPlayer } = useGameEngine(game)

  const handleCeilClick = useCallback(
    (fieldId: number, ceilId: number) => {
      game.sendMove(fieldId, ceilId)
    },
    [game]
  )

  const contextValue = useMemo(() => ({ game, onMove: handleCeilClick }), [game, handleCeilClick])

  return (
    <TicTacToeContext.Provider value={contextValue}>
      <GameWrapper gameEngine={game}>
        <div
          className="flex w-full flex-col items-center justify-center"
          inert={activePlayer !== currentPlayer || isClosed}
        >
          <div className="mb-2.5 flex items-center gap-2.5">Turn: {activePlayer}</div>

          {board ? <TicTacToeBoard /> : null}
        </div>
      </GameWrapper>
    </TicTacToeContext.Provider>
  )
}
