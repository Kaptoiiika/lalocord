import { create, StateCreator } from "zustand"
import { UserSchema } from "../typesS/UserSchema"
import {
  getUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./UserStoreLocalStorage"

const initUser = getUserFromLocalStorage()

const store: StateCreator<UserSchema> = (set, get) => ({
  localUser: initUser,

  setUsername(value) {
    saveUserToLocalStorage({ username: value, id: "local" })

    set((state) => ({ ...state, username: value }))
  },
})

export const useUserStore = create(store)
