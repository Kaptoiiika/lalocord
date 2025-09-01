import { classNames } from 'src/shared/lib/classNames/classNames'

import type { TicTacToeBoardType, TicTacToePlayerType } from '../../model/types/TicTacToe'

import { TicTacToeField } from '../TicTacToeField/TicTacToeField'

import styles from './TicTacToeBoard.module.scss'

type TicTacToeBoardProps = {
  board: TicTacToeBoardType
  activefield?: number
  player: TicTacToePlayerType
  onCeilClick?: (fieldId: number, ceilId: number) => void
}

export const TicTacToeBoard = (props: TicTacToeBoardProps) => {
  const { board, activefield, onCeilClick, player } = props

  return (
    <div className={styles['TicTacToeBoard']}>
      {board.map((field, index) => {
        const isDisabled = !!(activefield !== undefined && activefield !== index)

        return (
          <table
            inert={isDisabled}
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
              player={player}
            />
          </table>
        )
      })}
    </div>
  )
}
