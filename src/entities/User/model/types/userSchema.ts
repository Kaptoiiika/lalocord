export interface UserSchema {
  localUser: UserModel
  setUsername: (value: string) => void
}

export interface UserModel {
  id: string
  username: string
}
