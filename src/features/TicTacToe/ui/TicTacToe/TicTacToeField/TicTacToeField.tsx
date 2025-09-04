import { useTicTacToeContext } from 'src/features/TicTacToe/model/store/TicTacToeContext'
import { classNames } from 'src/shared/lib/classNames/classNames'
import { sliceIntoChunks } from 'src/shared/lib/utils/Arrays'

import type { TicTacToeFieldType } from '../../../model/types/TicTacToe'

import { TicTacToePlayer } from '../../../model/types/TicTacToe'
import { TicTacToeCeil } from '../TicTacToeCell/TicTacToeCeil'

import styles from './TicTacToeField.module.scss'

type TicTacToeFieldProps = TicTacToeFieldType

export const TicTacToeField = (props: TicTacToeFieldProps) => {
  const { game } = useTicTacToeContext()
  const { id: fieldId, cells, winner } = props

  if (!game) return null

  const splitedFields = sliceIntoChunks(cells, 3).filter((chunk) => chunk.length === 3)

  return (
    <tbody
      className={classNames(styles.TicTacToeField, {
        [styles.lastPlaced]: game.board.lastMove?.[0] === fieldId,
        [styles.fieldWinner]: winner !== TicTacToePlayer.EMPTY,
        [styles.circle]: winner === TicTacToePlayer.O,
        [styles.cross]: winner === TicTacToePlayer.X,
      })}
    >
      {splitedFields.map((row, rowIndex) => (
        <tr key={rowIndex}>
          {row.map((ceil) => (
            <TicTacToeCeil
              {...ceil}
              fieldId={fieldId}
              key={ceil.id}
            />
          ))}
        </tr>
      ))}
    </tbody>
  )
}
