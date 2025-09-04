import { TicTacToeGame } from 'src/widgets/TicTacToe'

import type { GameType } from '../model/GameEngine/GameEngine'
import type { WebRTCClient } from 'src/entities/WebRTC'

export const createGame = (gameType: GameType, peer: WebRTCClient) => {
  switch (gameType) {
    case 'TicTacToe':
      return new TicTacToeGame({
        id: peer.id,
        isCross: true,
        peer,
      })
  }
}

