import { sliceIntoChunks } from "@/shared/lib/utils/Arrays"
import { TicTacToeFieldType } from "../../model/types/TicTacToe"
import styles from "./TicTacToeField.module.scss"
import { TicTacToeCeil } from "../TicTacToe/TicTacToeCeil"

type TicTacToeFieldProps = {
  fields: TicTacToeFieldType
  onCeilClick?: (id: number) => void
}

export const TicTacToeField = (props: TicTacToeFieldProps) => {
  const { fields, onCeilClick } = props

  const splitedFields = sliceIntoChunks(fields, 3)

  return (
    <tbody className={styles["TicTacToeField"]}>
      {splitedFields.map((ceils, index) => (
        <tr key={index}>
          {ceils.map((ceil, ceilIndex) => (
            <TicTacToeCeil
              onClick={() => onCeilClick?.(ceilIndex + 3 * index)}
              key={ceilIndex}
              active={ceil}
            />
          ))}
        </tr>
      ))}
    </tbody>
  )
}
