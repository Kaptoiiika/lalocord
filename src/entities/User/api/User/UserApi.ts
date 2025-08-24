import { apiClient } from 'src/shared/api'

export const fetchUser = async (userId: number) => {
  const { data } = await apiClient.get(`/users/${userId}`)

  return data
}

