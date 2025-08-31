import { create } from 'zustand'

import type { UserModel } from 'src/entities/User'
import type { WebRTCClient } from 'src/entities/WebRTC'
import type { StateCreator } from 'zustand'

export type RoomUser = {
  id: number
  user: UserModel
  peer: WebRTCClient
}

type WebRTCRoomStore = {
  roomId?: string
  users: RoomUser[]

  addUser: (user: RoomUser) => void
  removeUser: (userId: number) => void

  joinRoom: (room: string) => void
  leaveRoom: () => void
}

const store: StateCreator<WebRTCRoomStore> = (set) => ({
  roomId: undefined,
  users: [],
  addUser: (user: RoomUser) => {
    set((state) => ({ users: [...state.users, user] }))
  },
  removeUser: (userId: number) => {
    set((state) => ({ users: state.users.filter((user) => user.id !== userId) }))
  },
  joinRoom: (room: string) => {
    set(() => ({ roomId: room }))
  },
  leaveRoom: () => {
    set(() => ({ roomId: undefined, users: [] }))
  },
})

export const useWebRTCRoomStore = create<WebRTCRoomStore>()(store)
