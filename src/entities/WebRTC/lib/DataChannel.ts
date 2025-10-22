import { logger } from 'src/shared/lib/logger/Logger'
import { Emitter } from 'src/shared/lib/utils'

type DataChannelEvents = {
  onChatMessage: MessageEvent
  onOpen: Event
  onClose: Event
}

type SupportMessage = string | ArrayBuffer | ArrayBufferView | Blob

export class DataChannel extends Emitter<DataChannelEvents> {
  channel: RTCDataChannel
  private messageQueue: SupportMessage[] = []

  isOpen: boolean = false

  onMessage?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: Event) => void

  constructor(peer: RTCPeerConnection, label: string, dataChannelDict?: RTCDataChannelInit) {
    super()
    this.channel = peer.createDataChannel(label, dataChannelDict)

    this.channel.onmessage = this.onDataMessage.bind(this)
    this.channel.onopen = this.onDataOpen.bind(this)
    this.channel.onclose = this.onDataClose.bind(this)
  }

  private onDataMessage(event: MessageEvent) {
    this.onMessage?.(event)
    this.emit('onChatMessage', event)
    return
  }

  private onDataOpen(event: Event) {
    this.isOpen = true
    this.onOpen?.(event)
    this.emit('onOpen', event)

    if (this.messageQueue.length) {
      this.messageQueue.forEach((message) => {
        this.send(message)
      })
    }

    return
  }

  private onDataClose(event: Event) {
    this.isOpen = false
    this.onClose?.(event)
    this.emit('onClose', event)
    return
  }

  send(data: SupportMessage): void {
    if (!this.isOpen) {
      this.messageQueue.push(data)

      logger('dataChanel is not open to send message')
      return
    }

    try {
      if (typeof data === 'string') {
        this.channel.send(data)
      } else if (data instanceof ArrayBuffer) {
        this.channel.send(data)
      } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
        this.channel.send(data)
      } else {
        this.channel.send(data as unknown as ArrayBuffer)
      }
    } catch (error) {
      console.log('error', error)
    }
  }
}
