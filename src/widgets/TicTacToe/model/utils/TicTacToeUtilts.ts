import type { TicTacToeBoardType, TicTacToeCeilType, TicTacToeFieldType } from '../types/TicTacToe'

import { TicTacToePlayer } from '../types/TicTacToe'

const winMap = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [0, 4, 8],
] as const

export const checkFieldIsWinnig = (field: TicTacToeFieldType) => {
  const { cells } = field

  for (let i = 0; i < winMap.length; i++) {
    const winCombination = winMap[i]
    const player = cells[winCombination[0]].player

    if (!player) continue
    if (player !== cells[winCombination[1]].player) continue
    if (player !== cells[winCombination[2]].player) continue

    return player
  }

  return null
}

export const checkBoardIsWinnig = (board: TicTacToeBoardType) => {
  const { fields } = board

  for (let i = 0; i < winMap.length; i++) {
    const winCombination = winMap[i]
    const player = fields[winCombination[0]].winner

    if (!player) continue
    if (player !== fields[winCombination[1]].winner) continue
    if (player !== fields[winCombination[2]].winner) continue

    return player
  }

  return null
}

export const createNewBoard = (): TicTacToeBoardType => {
  const fields = new Array(9).fill({}).map<TicTacToeFieldType>((_, index) => ({
    id: index,
    winner: TicTacToePlayer.EMPTY,
    cells: new Array(9)
      .fill({})
      .map<TicTacToeCeilType>((_, cellIndex) => ({ player: TicTacToePlayer.EMPTY, id: cellIndex })),
  }))

  const board: TicTacToeBoardType = {
    fields,
  }

  return board
}
