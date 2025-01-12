import { TicTacToeBoardType } from "../../model/types/TicTacToe"
import styles from "./TicTacToeBoard.module.scss"
import { TicTacToeField } from "../TicTacToeField/TicTacToeField"
import { classNames } from "@/shared/lib/classNames/classNames"

type TicTacToeBoardProps = {
  board: TicTacToeBoardType
  activefield?: number
  onCeilClick?: (fieldId: number, ceilId: number) => void
}

export const TicTacToeBoard = (props: TicTacToeBoardProps) => {
  const { board, activefield, onCeilClick } = props

  return (
    <div className={styles["TicTacToeBoard"]}>
      {board.map((field, index) => {
        const isDisabled =
          activefield !== undefined && activefield !== index ? true : false
        const inert = isDisabled ? { inert: "" } : {}

        return (
          <table
            {...inert}
            className={classNames(styles.field, {
              [styles.disable]: isDisabled,
            })}
            key={index}
          >
            <TicTacToeField
              onCeilClick={(ceilId) => {
                onCeilClick?.(index, ceilId)
              }}
              fields={field}
            />
          </table>
        )
      })}
    </div>
  )
}
