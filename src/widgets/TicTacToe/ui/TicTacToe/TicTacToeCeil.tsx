import { classNames } from "@/shared/lib/classNames/classNames"
import styles from "./TicTacToeCeil.module.scss"
import { TicTacToeCeilType } from "../../model/types/TicTacToe"
import { useTicTacToeStore } from "../../model/store/TicTacToeStore"

type TicTacToeCeilProps = {
  onClick?: () => void
  active?: TicTacToeCeilType
}

export const TicTacToeCeil = (props: TicTacToeCeilProps) => {
  const { onClick, active } = props
  const player = useTicTacToeStore((state) => state.currentPlayer)

  return (
    <td
      className={classNames(styles["TicTacToeCeil"], {
        [styles.playerCircle]: !active && player === "circle",
        [styles.playerSquare]: !active && player === "cross",
      })}
    >
      <button
        onClick={onClick}
        disabled={!!active}
        className={classNames(styles["button"], {
          [styles.symbolCircle]: active === "circle",
          [styles.symbolSquare]: active === "cross",
        })}
      />
    </td>
  )
}
