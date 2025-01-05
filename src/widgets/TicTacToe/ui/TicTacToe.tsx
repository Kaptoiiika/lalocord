import styles from "./TicTacToe.module.scss"
import { useTicTacToeStore } from "../model/store/TicTacToeStore"
import { TicTacToeBoard } from "./TicTacToeBoard/TicTacToeBoard"

type TicTacToeProps = {}

export const TicTacToe = (props: TicTacToeProps) => {
  const {} = props

  const board = useTicTacToeStore((state) => state.board)
  const handlePlayerMove = useTicTacToeStore((state) => state.doPlayerMove)
  // const restartGame = useTicTacToeStore((state) => state.startGame)
  const currentPlayer = useTicTacToeStore((state) => state.currentPlayer)

  const handleCeilClick = (fieldId: number, ceilId: number)=>{
    handlePlayerMove(fieldId,ceilId, currentPlayer)
  }

  // const handleRestartGame = ()=>{
  //   restartGame()
  // }

  return (
    <div className={styles.TicTacToe}>
      {/* <button onClick={handleRestartGame}>restartGame</button> */}
      {/* <TicTacToeField onCeilClick={handleCeilClick} fields={field} /> */}
      {board ? <TicTacToeBoard onCeilClick={handleCeilClick} board={board} /> : null}

    </div>
  )
}
