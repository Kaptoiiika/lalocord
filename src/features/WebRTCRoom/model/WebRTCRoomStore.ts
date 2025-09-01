import { create } from 'zustand'

import type { GameEngine, GameType } from 'src/entities/Game'
import type { UserModel } from 'src/entities/User'
import type { WebRTCClient } from 'src/entities/WebRTC'
import type { StateCreator } from 'zustand'

export type RoomUser = {
  id: string
  user: UserModel
  peer: WebRTCClient
}

export type MiniGame = {
  id: string
  userId: string
  type: GameType
  engine: GameEngine
}

type WebRTCRoomStore = {
  roomId?: string
  users: RoomUser[]

  miniGame: MiniGame[]
  addMiniGame: (miniGame: MiniGame) => void
  removeMiniGame: (miniGameId: string) => void

  addUser: (user: RoomUser) => void
  removeUser: (userId: string) => void

  joinRoom: (room: string) => void
  leaveRoom: () => void
}

const store: StateCreator<WebRTCRoomStore> = (set, get) => ({
  roomId: undefined,
  users: [],
  miniGame: [],

  addMiniGame: (miniGame: MiniGame) => {
    set((state) => ({ miniGame: [...state.miniGame, miniGame] }))
  },

  removeMiniGame: (miniGameId: string) => {
    set((state) => ({ miniGame: state.miniGame.filter((miniGame) => miniGame.id !== miniGameId) }))
  },

  addUser: (user: RoomUser) => {
    const users = get().users
    const existingUser = users.find((u) => u.id === user.id)
    if (existingUser) return console.log(`User #${user.id} already exists`)
    set((state) => ({ users: [...state.users, user] }))
  },
  removeUser: (userId: string) => {
    set((state) => ({ users: state.users.filter((user) => user.id !== userId) }))
  },
  joinRoom: (room: string) => {
    set(() => ({ roomId: room }))
  },
  leaveRoom: () => {
    set(() => ({ roomId: undefined, users: [], miniGame: [] }))
  },
})

export const useWebRTCRoomStore = create<WebRTCRoomStore>()(store)
