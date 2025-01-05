import { TicTacToeBoardType, TicTacToeFieldType } from "../types/TicTacToe"

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
  for (let i = 0; i < winMap.length; i++) {
    const winCombination = winMap[i]
    const player = field[winCombination[0]]

    if (!player) continue
    if (player !== field[winCombination[1]]) continue
    if (player !== field[winCombination[2]]) continue

    return player
  }

  return null
}

export const createNewBoard = (): TicTacToeBoardType => {
  const board: TicTacToeBoardType = [
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
  ]

  return board
}
