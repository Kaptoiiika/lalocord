import { useAsyncDataFetcher } from 'src/shared/lib/hooks'

import type { UserSchema } from '../store/UserStore'
import type { UserModel } from '../types/UserSchema'
import type { LoadingState } from 'src/shared/types/Loading'

import { fetchUser } from '../../api/User/UserApi'
import { useUserStore } from '../store/UserStore'

const getUserSelector = (state: UserSchema) => state.getUser

export const useUserById = (id: number): { user?: UserModel } & LoadingState => {
  const getUser = useUserStore(getUserSelector)

  const currentUser = getUser(id)
  const data = useAsyncDataFetcher(currentUser, fetchUser, id)

  return data
}
