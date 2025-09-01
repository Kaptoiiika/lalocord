import { Emitter } from 'src/shared/lib/utils'

import type { WebRTCClient } from 'src/entities/WebRTC'

export type GameType = 'TicTacToe'

export type Game = {
  id: string
  type: GameType
}

export type GameEngineConfig = Game & {
  peer: WebRTCClient
}

export type GameEngineEvents = {
  onMessage: unknown
  update: void
}

export type GameMessageAction<T> = {
  id: string
  type: 'message' | 'ready'
  payload: T
}

export class GameEngine extends Emitter<GameEngineEvents> {
  id: string
  type: GameType
  private peerChat: RTCDataChannel

  constructor(game: GameEngineConfig) {
    super()
    this.id = game.id
    this.type = game.type
    this.peerChat = game.peer.channelMiniGame

    this.peerChat.addEventListener('message', this.onChanelMessage.bind(this))
  }

  private onChanelMessage(event: MessageEvent) {
    const json = JSON.parse(event.data)
    const { id, type, payload } = json as GameMessageAction<unknown>

    if (id !== this.id) return

    if (type === 'message') {
      this.emit('onMessage', payload)
      this.onMessage(payload)
    }
  }

  onMessage(payload: unknown) {
    console.log(payload)
  }

  sendMessage(payload: unknown) {
    try {
      this.peerChat.send(JSON.stringify({ id: this.id, type: 'message', payload }))
    } catch (error) {
      console.log('error', error)
    }
  }
}

