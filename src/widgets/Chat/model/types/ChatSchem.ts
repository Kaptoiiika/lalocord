import { UserModel } from "@/entities/User"

export interface ChatSchema {
  messages: MessageModel[]

  addMessage: (message: MessageModel) => void
}

export interface MessageModel {
  user: UserModel
  data: string
}
