import { sliceIntoChunks } from "@/shared/lib/utils/Arrays"
import { TicTacToeFieldType } from "../../model/types/TicTacToe"
import styles from "./TicTacToeField.module.scss"
import { TicTacToeCeil } from "../TicTacToe/TicTacToeCeil"
import { classNames } from "@/shared/lib/classNames/classNames"

type TicTacToeFieldProps = {
  fields: TicTacToeFieldType
  onCeilClick?: (id: number) => void
}

export const TicTacToeField = (props: TicTacToeFieldProps) => {
  const { fields, onCeilClick } = props

  if (fields[9]) {
    const player = fields[9]
    return (
      <tbody
        className={classNames(styles.fieldWinner, {
          [styles.circle]: player === "circle",
          [styles.cross]: player === "cross",
        })}
      />
    )
  }

  const splitedFields = sliceIntoChunks(fields, 3)

  return (
    <tbody className={styles["TicTacToeField"]}>
      {splitedFields.map((ceils, index) => (
        <tr key={index}>
          {ceils.map((ceil, ceilIndex) => (
            <TicTacToeCeil
              onClick={() => onCeilClick?.(ceilIndex + 3 * index)}
              active={ceil}
              key={ceilIndex}
            />
          ))}
        </tr>
      ))}
    </tbody>
  )
}
