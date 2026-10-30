import { io } from 'socket.io-client'
import { __API_URL__ } from 'src/shared/const/config'

const url = new URL(__API_URL__ || '', window.location.origin)

const isGameWindow = () => {
  const path = window.location.pathname
  const hash = window.location.hash

  return path.endsWith('/game-session') || hash.startsWith('#/game-session')
}

export const socketClient = io(url.origin, {
  path: url.pathname === '/' ? '' : url.pathname + '/socket.io',
  reconnectionDelayMax: 5000,
  autoConnect: !isGameWindow(),
})
