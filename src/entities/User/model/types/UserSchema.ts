export interface UserSchema {
  localUser: UserModel
  setLocalUsername: (value: string) => void
}

export interface UserModel {
  id: string
  username: string
}
