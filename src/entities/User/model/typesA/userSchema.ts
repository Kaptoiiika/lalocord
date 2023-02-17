import { FileRespounce } from "@/shared/api/types/FilteTypes"

export interface UserSchema {
  authData?: UserModel
  isInited: boolean
}

export interface UserModel {
  id: number
  username: string
  email: string
  avatar?: FileRespounce
}
