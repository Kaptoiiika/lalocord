import { TicTacToeGame } from 'src/widgets/TicTacToe'

import type { GameType } from '../model/GameEngine/GameEngine'
import type { WebRTCClient } from 'src/entities/WebRTC'

export type createGameConfig = {
  gameType: GameType
  peer: WebRTCClient
  id: string
  isHost: boolean
}

export const createGame = (config: createGameConfig) => {
  const { gameType, peer, id, isHost } = config

  switch (gameType) {
    case 'TicTacToe':
      return new TicTacToeGame({
        id,
        isCross: isHost,
        peer,
      })
  }
}

