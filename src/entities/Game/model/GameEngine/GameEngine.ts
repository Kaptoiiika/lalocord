import { logger } from 'src/shared/lib/logger/Logger'
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

export type MiniGame = {
  id: string
  userId: string
  type: GameType
  engine: GameEngine
}

export type GameEngineEvents = {
  onClose: void
  onMessage: unknown
  update: void
}

export type GameMessageAction<T> = {
  id: string
  type: 'message' | 'close'
  payload: T
}

export class GameEngine extends Emitter<GameEngineEvents> {
  id: string
  type: GameType
  isClosed = false
  private peerChat: RTCDataChannel

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private subscribedEvents: Record<string, (...args: any) => void> = {}

  constructor(game: GameEngineConfig) {
    super()
    this.id = game.id
    this.type = game.type
    this.peerChat = game.peer.channelMiniGame

    const bindedOnChanelMessage = this.onChanelMessage.bind(this)
    this.subscribedEvents['message'] = bindedOnChanelMessage
    this.peerChat.addEventListener('message', bindedOnChanelMessage)

    const bindedOnClose = this.onEngineClose.bind(this)
    this.subscribedEvents['close'] = bindedOnClose
    this.peerChat.addEventListener('close', bindedOnClose)
  }

  private onChanelMessage(event: MessageEvent) {
    const json = JSON.parse(event.data)
    const { id, type, payload } = json as GameMessageAction<unknown>

    if (id !== this.id) return

    if (type === 'message') {
      this.emit('onMessage', payload)
      this.onMessage(payload)
    } else if (type === 'close') {
      this.onEngineClose()
    }
  }

  private onEngineClose() {
    if (this.isClosed) return logger(`Engine ${this.id} is already closed`)

    Object.entries(this.subscribedEvents).forEach(([event, callback]) => {
      this.peerChat.removeEventListener(event, callback)
    })
    this.isClosed = true
    this.emit('onClose', undefined)
  }

  closeEngine() {
    try {
      this.peerChat.send(JSON.stringify({ id: this.id, type: 'close' }))
    } catch (error) {
      console.log('error', error)
    }
    this.onEngineClose()
  }

  onMessage(payload: unknown) {
    logger('onMessage', payload)
  }

  sendMessage(payload: unknown) {
    logger('sendMessage', payload)
    try {
      this.peerChat.send(JSON.stringify({ id: this.id, type: 'message', payload }))
    } catch (error) {
      console.log('error', error)
    }
  }
}
