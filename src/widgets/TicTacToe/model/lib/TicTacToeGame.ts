import { GameEngine } from 'src/entities/Game'

import type { TicTacToeBoardType } from '../types/TicTacToe'
import type { GameEngineConfig } from 'src/entities/Game'

import { TicTacToePlayer } from '../types/TicTacToe'
import { checkBoardIsWinnig, checkFieldIsWinnig, createNewBoard } from '../utils/TicTacToeUtilts'

type TicTacToeMovePayload = {
  action: 'move'
  fieldId: number
  ceilId: number
  player: TicTacToePlayer
}

export type TicTacToeGameConfig = Omit<GameEngineConfig, 'type'> & {
  isCross: boolean
}

export class TicTacToeGame extends GameEngine {
  isEnded = false
  winner: TicTacToePlayer | null = null
  board: TicTacToeBoardType
  activePlayer: TicTacToePlayer
  activeFieldId: number | undefined
  currentPlayer: TicTacToePlayer

  constructor(config: TicTacToeGameConfig) {
    super({ ...config, type: 'TicTacToe' })
    this.board = createNewBoard()
    this.currentPlayer = config.isCross ? TicTacToePlayer.X : TicTacToePlayer.O
    this.activePlayer = TicTacToePlayer.X
  }

  private doPlayerMove(fieldId: number, ceilId: number, player: TicTacToePlayer) {
    if (fieldId > 8 || ceilId > 8) throw new Error('Field or ceil id is out of range')
    if (this.board.fields[fieldId].cells[ceilId].player !== TicTacToePlayer.EMPTY)
      throw new Error('Field or ceil is already taken')
    if (player !== this.activePlayer) throw new Error('Player is not the active player')

    const newBoard = this.board
    newBoard.lastMove = [fieldId, ceilId, player]

    newBoard.fields[fieldId].cells[ceilId].player = player
    const newActivePlayer = player === TicTacToePlayer.O ? TicTacToePlayer.X : TicTacToePlayer.O

    if (checkFieldIsWinnig(newBoard.fields[fieldId])) {
      newBoard.fields[fieldId].winner = player

      if (checkBoardIsWinnig(newBoard)) {
        this.winner = player
        this.isEnded = true
      }
    }

    this.board = newBoard
    this.activePlayer = newActivePlayer
    this.activeFieldId = newBoard.fields[ceilId].winner === TicTacToePlayer.EMPTY ? ceilId : undefined
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

  changeCurrentPlayer(player: TicTacToePlayer) {
    this.currentPlayer = player
  }
}
