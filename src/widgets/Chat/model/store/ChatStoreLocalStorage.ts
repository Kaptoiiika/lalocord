import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { ChatSchema } from "../types/ChatSchema"

export const saveChatAudioToLocalStorage = (
  data: Pick<ChatSchema, "silent">
) => {
  localStorage.setItem(localstorageKeys.CHATSILENT, JSON.stringify(data.silent))
}

export const getChatAudioFromLocalStorage = () => {
  const json = localStorage.getItem(localstorageKeys.CHATSILENT)
  if (!json) return false
  const data = JSON.parse(json)
  return !!data
}
