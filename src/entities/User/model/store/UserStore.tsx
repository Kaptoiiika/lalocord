import { create, StateCreator } from "zustand"
import { UserSchema } from "../types/UserSchema"
import {
  getUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./UserStoreLocalStorage"

const initUser = getUserFromLocalStorage()

const store: StateCreator<UserSchema> = (set, get) => ({
  localUser: initUser,

  setLocalUsername(value) {
    const user = get().localUser
    user.username = value

    set((state) => ({ ...state, localUser: { ...user } }))
    saveUserToLocalStorage(user)
  },
})

export const useUserStore = create(store)
