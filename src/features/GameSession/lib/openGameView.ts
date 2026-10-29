import { IpcChannels } from 'electron/main/types/ipcChannels'
import { BASE_URL } from 'src/shared/const/config'
import { GAME_VIEW_CHANNEL } from 'src/shared/types/GameSession'

import type { GameSessionOffer } from 'src/shared/types/GameSession'

const gameViewUrl = () => {
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`

  return new URL(`${base}game-view`, window.location.origin).href
}

export const openGameView = (offer: GameSessionOffer) => {
  if (window.electron) {
    window.electron.ipcRenderer.sendMessage(IpcChannels.gameViewOpen, offer)
    let isClosed = false

    return () => {
      if (isClosed) return
      isClosed = true
      window.electron?.ipcRenderer.sendMessage(IpcChannels.gameViewClose, undefined)
    }
  }

  const popup = window.open(gameViewUrl(), 'lalocord-game', 'popup,width=1280,height=720')
  const channel = new BroadcastChannel(GAME_VIEW_CHANNEL)
  let isClosed = false
  let isAcknowledged = false
  const publish = () => {
    channel.postMessage({ type: 'offer', offer })
  }

  channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === 'ready' && !isAcknowledged) publish()
    if (event.data?.type === 'ack') isAcknowledged = true
  }
  publish()

  return () => {
    if (isClosed) return
    isClosed = true
    channel.postMessage({ type: 'close' })
    popup?.close()
    channel.close()
  }
}
