import { GameEngine } from 'src/entities/Game'

import type { TicTacToeBoardType, TicTacToePlayerType } from '../types/TicTacToe'
import type { GameEngineConfig } from 'src/entities/Game'

import { checkFieldIsWinnig, createNewBoard } from '../utils/TicTacToeUtilts'

type TicTacToeMovePayload = {
  action: 'move'
  fieldId: number
  ceilId: number
  player: TicTacToePlayerType
}

export type TicTacToeGameConfig = GameEngineConfig & {
  isCross: boolean
}

export class TicTacToeGame extends GameEngine {
  board: TicTacToeBoardType
  activePlayer: TicTacToePlayerType
  activeFieldId: number | undefined
  readonly currentPlayer: TicTacToePlayerType

  constructor(game: TicTacToeGameConfig) {
    super(game)
    this.board = createNewBoard()
    this.currentPlayer = game.isCross ? 'cross' : 'circle'
    this.activePlayer = 'cross'
  }

  private doPlayerMove(fieldId: number, ceilId: number, player: TicTacToePlayerType) {
    if (fieldId > 8 || ceilId > 8) return
    if (this.board[fieldId][ceilId] !== null) return

    const newBoard = [...this.board]

    newBoard[fieldId][ceilId] = player
    const newActivePlayer = player === 'circle' ? 'cross' : 'circle'

    if (checkFieldIsWinnig(newBoard[fieldId])) {
      newBoard[fieldId][9] = player
    }

    this.board = newBoard
    this.activePlayer = newActivePlayer
    this.activeFieldId = newBoard[ceilId][9] ? undefined : ceilId
  }

  onMessage(payload: unknown) {
    const { action, fieldId, ceilId, player } = payload as TicTacToeMovePayload

    if (action === 'move') this.doPlayerMove(fieldId, ceilId, player)
    this.emit('update', undefined)
  }

  sendMove(fieldId: number, ceilId: number) {
    const payload: TicTacToeMovePayload = { action: 'move', fieldId, ceilId, player: this.currentPlayer }
    this.doPlayerMove(fieldId, ceilId, this.currentPlayer)
    this.sendMessage(payload)
    this.emit('update', undefined)
  }
}

