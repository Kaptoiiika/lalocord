import { TicTacToeBoardType } from "../../model/types/TicTacToe"
import styles from "./TicTacToeBoard.module.scss"
import { TicTacToeField } from "../TicTacToeField/TicTacToeField"

type TicTacToeBoardProps = {
  board: TicTacToeBoardType
  onCeilClick?: (fieldId: number, ceilId: number) => void
}

export const TicTacToeBoard = (props: TicTacToeBoardProps) => {
  const { board, onCeilClick } = props

  return (
    <div className={styles["TicTacToeBoard"]}>
      {board.map((field, index) => (
        <table className={styles.field} key={index}>
          <TicTacToeField
            onCeilClick={(ceilId) => {
              onCeilClick?.(index, ceilId)
            }}
            fields={field}
          />
        </table>
      ))}
    </div>
  )
}
