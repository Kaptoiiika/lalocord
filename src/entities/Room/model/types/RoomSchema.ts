// eslint-disable-next-line boundaries/element-types
import { UserModel } from "@/entities/User"

export interface RoomModel {
  name: string
  id: string
  userList: UserModel[]
}
