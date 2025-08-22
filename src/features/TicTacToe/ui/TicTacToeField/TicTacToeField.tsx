import { classNames } from 'src/shared/lib/classNames/classNames';
import { sliceIntoChunks } from 'src/shared/lib/utils/Arrays';

import type { TicTacToeFieldType } from '../../model/types/TicTacToe';

import { TicTacToeCeil } from '../TicTacToe/TicTacToeCeil';

import styles from './TicTacToeField.module.scss';


type TicTacToeFieldProps = {
  fields: TicTacToeFieldType;
  onCeilClick?: (id: number) => void;
};

export const TicTacToeField = (props: TicTacToeFieldProps) => {
  const { fields, onCeilClick } = props;

  const winnerPlayer = fields[9];

  const splitedFields = sliceIntoChunks(fields, 3).filter(
    (chunk) => chunk.length === 3
  );

  return (
    <tbody
      className={classNames(styles.TicTacToeField, {
        [styles.fieldWinner]: winnerPlayer,
        [styles.circle]: winnerPlayer === 'circle',
        [styles.cross]: winnerPlayer === 'cross',
      })}
    >
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
  );
};
