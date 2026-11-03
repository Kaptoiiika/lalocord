import type { PropsWithChildren } from 'react'

import { useIsOpen } from 'src/shared/lib/hooks'
import { Button } from 'src/shared/ui'

import { TicTacToeSelectOpponent } from './TicTacToeSelectOpponent/TicTacToeSelectOpponent'

type TicTacToePrepareGameProps = { onStart?: (userId: string) => void } & PropsWithChildren

export const TicTacToePrepareGame = (props: TicTacToePrepareGameProps) => {
  const { onStart } = props

  const { handleOpen, open, handleClose } = useIsOpen()

  const handleStartGame = (userId: string) => {
    handleClose()
    onStart?.(userId)
  }

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleOpen}
      >
        Tic Tac Toe
      </Button>

      <TicTacToeSelectOpponent
        onClose={handleClose}
        open={open}
        onSelect={handleStartGame}
      />
    </>
  )
}
