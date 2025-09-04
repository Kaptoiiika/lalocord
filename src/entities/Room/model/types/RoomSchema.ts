import type { UserModel } from 'src/entities/User'

export interface RoomModel {
  name: string
  id: string
  userList: UserModel[]
}
