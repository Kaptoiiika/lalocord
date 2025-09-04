export enum TicTacToePlayer {
  X = 'cross',
  O = 'circle',
  EMPTY = '',
}

export type TicTacToeCeilType = {
  id: number
  player: TicTacToePlayer
}

export type TicTacToeFieldType = {
  id: number
  cells: Array<TicTacToeCeilType>
  winner: TicTacToePlayer
}

export type TicTacToeBoardType = {
  fields: Array<TicTacToeFieldType>
  /**
   * [fieldId, ceilId, player]
   *
   * @type {[number, number, TicTacToePlayer]}
   */
  lastMove?: [number, number, TicTacToePlayer]
}
