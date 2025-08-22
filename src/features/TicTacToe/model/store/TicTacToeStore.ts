import { create } from 'zustand';

import type { TicTacToeSchema } from '../types/TicTacToe';
import type { StateCreator } from 'zustand';

import { checkFieldIsWinnig, createNewBoard } from '../utils/TicTacToeUtilts';

const store: StateCreator<TicTacToeSchema> = (set, get) => ({
  board: createNewBoard(),
  activePlayer: 'cross',
  currentPlayer: 'cross',
  isMultiplayer: false,

  doPlayerMove(fieldId, ceilId, player) {
    const { board, currentPlayer, isMultiplayer } = get();

    if (fieldId > 8 || ceilId > 8) return;
    if (board[fieldId][ceilId] !== null) return;

    const newBoard = [...board];

    newBoard[fieldId][ceilId] = player;
    const newActivePlayer = player === 'circle' ? 'cross' : 'circle';

    if (checkFieldIsWinnig(newBoard[fieldId])) {
      newBoard[fieldId][9] = player;
    }

    const newActiveFieldId = newBoard[ceilId][9] ? undefined : ceilId;

    set((state) => ({
      ...state,
      board: newBoard,
      activePlayer: newActivePlayer,
      activeFieldId: newActiveFieldId,
      currentPlayer: isMultiplayer ? currentPlayer : newActivePlayer,
    }));
  },

  startGame(isMultiplayer = false) {
    set(() => ({
      board: createNewBoard(),
      activePlayer: 'cross',
      currentPlayer: 'cross',
      activeFieldId: undefined,
      isMultiplayer,
    }));
  },
});

export const useTicTacToeStore = create(store);
