import { useEffect, useState } from 'react'

import { Button } from '@mui/material'

import type { TicTacToeGame } from '../model/lib/TicTacToeGame'

import { TicTacToeBoard } from './TicTacToeBoard/TicTacToeBoard'
import { useTicTacToeStore } from '../model/store/TicTacToeStore'

import styles from './TicTacToe.module.scss'

export const TicTacToe = () => {
  const board = useTicTacToeStore((state) => state.board)
  const handlePlayerMove = useTicTacToeStore((state) => state.doPlayerMove)
  const restartGame = useTicTacToeStore((state) => state.startGame)
  const currentPlayer = useTicTacToeStore((state) => state.currentPlayer)
  const activeFieldId = useTicTacToeStore((state) => state.activeFieldId)

  const handleCeilClick = (fieldId: number, ceilId: number) => {
    handlePlayerMove(fieldId, ceilId, currentPlayer)
  }

  const handleRestartGame = () => {
    restartGame()
  }

  return (
    <div className={styles.TicTacToe}>
      <div className={styles.wrapper}>
        <Button onClick={handleRestartGame}>restart</Button>
        {board ? (
          <TicTacToeBoard
            onCeilClick={handleCeilClick}
            activefield={activeFieldId}
            board={board}
            player={currentPlayer}
          />
        ) : null}
      </div>
    </div>
  )
}

type TicTacToeMultiplayerProps = {
  game: TicTacToeGame
}

export const TicTacToeMultiplayer = (props: TicTacToeMultiplayerProps) => {
  const { game } = props
  const board = game.board
  const activePlayer = game.activePlayer
  const currentPlayer = game.currentPlayer
  const activeFieldId = game.activeFieldId
  const [, update] = useState(0)


  console.log(board, currentPlayer, activeFieldId )
  useEffect(() => {
    const updateFn = () => {
      console.log('update')
      update((prev) => prev + 1)
    }

    game.on('update', updateFn)

    return () => {
      game.off('update', updateFn)
    }
  }, [game])

  const handleCeilClick = (fieldId: number, ceilId: number) => {
    game.sendMove(fieldId, ceilId)
  }

  return (
    <div className={styles.TicTacToe}>
      <div className={styles.wrapper} inert={activePlayer !== currentPlayer}>
        {board ? (
          <TicTacToeBoard
            onCeilClick={handleCeilClick}
            activefield={activeFieldId}
            board={board}
            player={currentPlayer}
          />
        ) : null}
      </div>
    </div>
  )
}
