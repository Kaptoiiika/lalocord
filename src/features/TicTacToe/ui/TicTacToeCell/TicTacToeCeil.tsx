import { classNames } from 'src/shared/lib/classNames/classNames'

import type { TicTacToeCeilType, TicTacToePlayerType } from '../../model/types/TicTacToe'

import styles from './TicTacToeCeil.module.scss'

type TicTacToeCeilProps = {
  onClick?: () => void
  active?: TicTacToeCeilType
  player: TicTacToePlayerType
}

export const TicTacToeCeil = (props: TicTacToeCeilProps) => {
  const { onClick, active, player } = props

  return (
    <td
      className={classNames(styles['TicTacToeCeil'], {
        [styles.playerCircle]: !active && player === 'circle',
        [styles.playerSquare]: !active && player === 'cross',
      })}
    >
      <button
        onClick={onClick}
        disabled={!!active}
        className={classNames(styles['button'], {
          [styles.symbolCircle]: active === 'circle',
          [styles.symbolSquare]: active === 'cross',
        })}
      />
    </td>
  )
}
