import { Button } from '@mui/material';

import { TicTacToeBoard } from './TicTacToeBoard/TicTacToeBoard';
import { useTicTacToeStore } from '../model/store/TicTacToeStore';

import styles from './TicTacToe.module.scss';

export const TicTacToe = () => {
  const board = useTicTacToeStore((state) => state.board);
  const handlePlayerMove = useTicTacToeStore((state) => state.doPlayerMove);
  const restartGame = useTicTacToeStore((state) => state.startGame);
  const currentPlayer = useTicTacToeStore((state) => state.currentPlayer);
  const activeFieldId = useTicTacToeStore((state) => state.activeFieldId);

  const handleCeilClick = (fieldId: number, ceilId: number) => {
    handlePlayerMove(fieldId, ceilId, currentPlayer);
  };

  const handleRestartGame = () => {
    restartGame();
  };

  return (
    <div className={styles.TicTacToe}>
      <div className={styles.wrapper}>
        <Button onClick={handleRestartGame}>restart</Button>
        {board ? (
          <TicTacToeBoard
            onCeilClick={handleCeilClick}
            activefield={activeFieldId}
            board={board}
          />
        ) : null}
      </div>
    </div>
  );
};
