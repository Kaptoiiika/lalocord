import { create } from 'zustand'

import type { UserModel } from '../types/UserSchema'
import type { StateCreator } from 'zustand'

import { getUserFromLocalStorage, saveUserToLocalStorage } from './UserStoreLocalStorage'

export interface LocalUserSchema {
  localUser: UserModel
  
  setLocalUsername: (value: string) => void
  setLocalAvatar: (src: string) => void
}

const initUser = getUserFromLocalStorage()

const store: StateCreator<LocalUserSchema> = (set, get) => ({
  localUser: initUser,

  setLocalUsername(value) {
    const user = get().localUser

    user.username = value

    set((state) => ({
      ...state,
      localUser: {
        ...user,
      },
    }))
    saveUserToLocalStorage(user)
  },

  setLocalAvatar(value) {
    const user = get().localUser

    user.avatar = value

    set((state) => ({
      ...state,
      localUser: {
        ...user,
      },
    }))
    saveUserToLocalStorage(user)
  },
})

export const useLocalUserStore = create(store)
