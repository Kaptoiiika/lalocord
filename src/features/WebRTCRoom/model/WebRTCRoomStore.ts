import { createGame } from 'src/entities/Game'
import { create } from 'zustand'

import type { createGameConfig, GameEngine } from 'src/entities/Game'
import type { UserModel } from 'src/entities/User'
import type { WebRTCClient } from 'src/entities/WebRTC'
import type { StateCreator } from 'zustand'

export type RoomUser = {
  id: string
  user: UserModel
  peer: WebRTCClient
}

type WebRTCRoomStore = {
  roomId?: string
  users: RoomUser[]

  miniGame: GameEngine[]
  addMiniGame: (gameConfig: createGameConfig) => void
  removeMiniGame: (gameId: string) => void

  addUser: (user: RoomUser) => void
  replaceUsers: (users: RoomUser[]) => void
  removeUser: (userId: string) => void

  joinRoom: (room: string) => void
  leaveRoom: () => void
}

const store: StateCreator<WebRTCRoomStore> = (set, get) => ({
  roomId: undefined,
  users: [],
  miniGame: [],

  addMiniGame: (gameConfig: createGameConfig) => {
    const game = createGame(gameConfig)
    set((state) => ({ miniGame: [...state.miniGame, game] }))
  },

  removeMiniGame: (gameId: string) => {
    set((state) => ({ miniGame: state.miniGame.filter((miniGame) => miniGame.id !== gameId) }))
  },

  addUser: (user: RoomUser) => {
    const users = get().users
    const existingUserIndex = users.findIndex((roomUser) => roomUser.id === user.id)

    if (existingUserIndex === -1) {
      set((state) => ({ users: state.users.concat(user) }))
      return
    }

    const nextUsers = users.slice()
    nextUsers[existingUserIndex].peer.close()
    nextUsers[existingUserIndex] = user
    set({ users: nextUsers })
  },
  replaceUsers: (users: RoomUser[]) => {
    get().users.forEach((roomUser) => {
      roomUser.peer.close()
    })
    set({ users })
  },
  removeUser: (userId: string) => {
    const roomUser = get().users.find((user) => user.id === userId)
    roomUser?.peer.close()
    set((state) => ({ users: state.users.filter((user) => user.id !== userId) }))
  },
  joinRoom: (room: string) => {
    set(() => ({ roomId: room }))
  },
  leaveRoom: () => {
    get().users.forEach((roomUser) => {
      roomUser.peer.close()
    })
    set(() => ({ roomId: undefined, users: [], miniGame: [] }))
  },
})

export const useWebRTCRoomStore = create<WebRTCRoomStore>()(store)
