import { useIsOpen } from "@/shared/lib/hooks/useIsOpen/useIsOpen"
import { Button } from "@mui/material"
import { PropsWithChildren } from "react"
import { TicTacToeSelectOpponent } from "../TicTacToeSelectOpponent/TicTacToeSelectOpponent"

type TicTacToePrepareGameProps = { onStart?: () => void } & PropsWithChildren

export const TicTacToePrepareGame = (props: TicTacToePrepareGameProps) => {
  const { onStart } = props

  const { handleOpen, open, handleClose } = useIsOpen()

  const handleStartGame = () => {
    handleClose()
    onStart?.()
  }

  return (
    <>
      <Button className="TicTacToePrepareGame" onClick={handleOpen}>
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
