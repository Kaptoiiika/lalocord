import type { AxiosInstance } from 'axios'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'

export const deleteTokenFromApi = (api: AxiosInstance) => {
  localStorage.removeItem(localstorageKeys.TOKEN)
  api.defaults.headers.common['Authorization'] = undefined
}
