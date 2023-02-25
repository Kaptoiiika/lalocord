import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { UserModel } from "../types/UserSchema"

const defaultUser: UserModel = {
  id: "local",
  username: "",
}

export const getUserFromLocalStorage = (): UserModel => {
  const json = localStorage.getItem(localstorageKeys.USERINFO)
  if (!json) return defaultUser
  const data = JSON.parse(json)
  const res: UserModel = {
    id: defaultUser.id,
    username: data?.username ? `${data?.username}` : defaultUser.username,
  }
  return res
}

export const saveUserToLocalStorage = (user: UserModel) => {
  localStorage.setItem(localstorageKeys.USERINFO, JSON.stringify(user))
}
