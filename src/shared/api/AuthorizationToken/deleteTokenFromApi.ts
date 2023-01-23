import { AxiosInstance } from "axios"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"

export const deleteTokenFromApi = (api: AxiosInstance) => {
  localStorage.removeItem(localstorageKeys.TOKEN)
  api.defaults.headers.common["Authorization"] = undefined
}
