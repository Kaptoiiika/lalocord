import { create } from 'zustand'

import type { UserModel } from '../types/UserSchema'
import type { StateCreator } from 'zustand'

export type UserSchema = {
  userList: Map<number, UserModel>
  addUser: (user: UserModel) => void
  addUsers: (users: UserModel[]) => void
  updateUser: (id: number, updatedFields: Partial<UserModel>) => void
  getUser: (id: number) => UserModel | undefined
}

const store: StateCreator<UserSchema> = (set, get) => ({
  userList: new Map(),

  addUser: (user) => {
    set((state) => {
      const newUserList = new Map(state.userList)
      newUserList.set(Number(user.id), user)
      return { ...state, userList: newUserList }
    })
  },

  addUsers: (users) => {
    set((state) => {
      const newUserList = new Map(state.userList)
      users.forEach((u) => {
        newUserList.set(Number(u.id), u)
      })
      return { ...state, userList: newUserList }
    })
  },

  updateUser: (id, updatedFields) => {
    set((state) => {
      const newUserList = new Map(state.userList)
      const user = newUserList.get(id)
      if (user) {
        const updatedUser = { ...user, ...updatedFields }
        newUserList.set(id, updatedUser)
      }
      return { ...state, userList: newUserList }
    })
  },

  getUser: (id) => {
    const userList = get().userList
    return userList.get(id)
  },
})

export const useUserStore = create(store)
