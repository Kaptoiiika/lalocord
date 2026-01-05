import { useCallback, useMemo, useState } from 'react'

import { Button, Typography } from '@mui/material'
import { GameWrapper, useGameEngine } from 'src/entities/Game'

import type { WebRTCClient } from 'src/entities/WebRTC'

import { TicTacToeBoard } from './TicTacToe/TicTacToeBoard/TicTacToeBoard'
import { TicTacToeGame } from '../model/lib/TicTacToeGame'
import { TicTacToeContext } from '../model/store/TicTacToeContext'
import { TicTacToePlayer } from '../model/types/TicTacToe'

import styles from './TicTacToe.module.scss'

export const TicTacToe = () => {
  const [game, setGame] = useState<TicTacToeGame>(
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
  )
  const board = game?.board
  const currentPlayer = game?.currentPlayer
  useGameEngine(game)

  const handleCeilClick = (fieldId: number, ceilId: number) => {
    game?.sendMove?.(fieldId, ceilId)
    game?.changeCurrentPlayer?.(currentPlayer === TicTacToePlayer.O ? TicTacToePlayer.X : TicTacToePlayer.O)
  }

  const handleRestartGame = () => {
    setGame(
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
    )
  }

  return (
    <TicTacToeContext.Provider value={{ game, onMove: handleCeilClick }}>
      <div className={styles.TicTacToe}>
        <div className={styles.header}>
          <Button
            variant="contained"
            onClick={handleRestartGame}
          >
            restart
          </Button>
          <Typography variant="h4">Turn: {currentPlayer}</Typography>
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
          className={styles.TicTacToe}
          inert={activePlayer !== currentPlayer || isClosed}
        >
          <div className={styles.header}>Turn: {activePlayer}</div>

          {board ? <TicTacToeBoard /> : null}
        </div>
      </GameWrapper>
    </TicTacToeContext.Provider>
  )
}
