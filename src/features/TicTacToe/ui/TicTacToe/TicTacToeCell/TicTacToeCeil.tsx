import { TicTacToePlayer } from 'src/features/TicTacToe/model/types/TicTacToe'
import { classNames } from 'src/shared/lib/classNames/classNames'

import type { TicTacToeCeilType } from 'src/features/TicTacToe/model/types/TicTacToe'

import { useTicTacToeContext } from '../../../model/store/TicTacToeContext'

import styles from './TicTacToeCeil.module.scss'

type TicTacToeCeilProps = {
  fieldId: number
} & TicTacToeCeilType

export const TicTacToeCeil = (props: TicTacToeCeilProps) => {
  const { fieldId, id: ceilId, player } = props
  const { game, onMove } = useTicTacToeContext()

  if (!game) return null

  const activePlayer = game.activePlayer
  const isActive = player !== TicTacToePlayer.EMPTY
  const isLastPlaced = game.board.lastMove?.[0] === fieldId && game.board.lastMove?.[1] === ceilId

  return (
    <td
      className={classNames(styles['TicTacToeCeil'], {
        [styles.lastPlaced]: isLastPlaced,
        [styles.playerCircle]: !isActive && activePlayer === TicTacToePlayer.O,
        [styles.playerSquare]: !isActive && activePlayer === TicTacToePlayer.X,
      })}
    >
      <button
        onClick={() => onMove(fieldId, ceilId)}
        disabled={isActive}
        className={classNames(styles['button'], {
          [styles.symbolCircle]: player === TicTacToePlayer.O,
          [styles.symbolSquare]: player === TicTacToePlayer.X,
        })}
      />
    </td>
  )
}
