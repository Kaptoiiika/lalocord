import { classNames } from 'src/shared/lib/classNames/classNames'

import { useTicTacToeContext } from '../../../model/store/TicTacToeContext'
import { TicTacToeField } from '../TicTacToeField/TicTacToeField'

import styles from './TicTacToeBoard.module.scss'

export const TicTacToeBoard = () => {
  const { game } = useTicTacToeContext()

  if (!game) return null

  const fields = game.board.fields
  const activeFieldId = game.activeFieldId

  return (
    <div className={styles['TicTacToeBoard']}>
      {fields.map((field) => (
        <table
          inert={activeFieldId === undefined ? false : activeFieldId !== field.id}
          className={classNames(styles.field, {
            [styles.disable]: activeFieldId !== undefined && activeFieldId !== field.id,
          })}
          key={field.id}
        >
          <TicTacToeField {...field} />
        </table>
      ))}
    </div>
  )
}
