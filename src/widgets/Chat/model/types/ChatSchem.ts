import { UserModel } from "@/entities/User"

export interface ChatSchema {
  messages: MessageModel[]
  audio: HTMLAudioElement

  addMessage: (message: MessageModel, playSound?: boolean) => void
}

export interface MessageModel {
  user: UserModel
  data: string
}
