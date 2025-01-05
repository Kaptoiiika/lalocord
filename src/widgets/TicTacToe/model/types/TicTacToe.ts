export interface TicTacToeSchema {
  currentPlayer: TicTacToePlayerType
  activePlayer: TicTacToePlayerType
  
  activeField?: TicTacToeFieldType
  board: TicTacToeBoardType

  isMultiplayer: boolean

  doPlayerMove: (fieldId: number, ceilId: number, player: TicTacToePlayerType) => void

  startGame: (isMultiplayer?: boolean) => void
}

export type TicTacToePlayerType = "circle" | "cross"
export type TicTacToeCeilType = TicTacToePlayerType | null
export type TicTacToeFieldType = Array<TicTacToeCeilType>
export type TicTacToeBoardType = Array<TicTacToeFieldType>
