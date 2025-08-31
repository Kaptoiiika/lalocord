import { apiClient } from 'src/shared/api'

import type { UserModel } from '../../model/types/UserSchema'

export const fetchUser = async (userId: number) => {
  const { data } = await apiClient.get<UserModel>(`/user/${userId}`)

  return data
}

export const fetchUsers = async () => {
  const { data } = await apiClient.get<UserModel[]>(`/user`)

  return data
}

export const createUser = async (user: Omit<UserModel, 'id'>) => {
  const { data } = await apiClient.post<UserModel>(`/user`, user)

  return data
}

export const updateUser = async (user: Omit<UserModel, 'id'>) => {
  const { data } = await apiClient.put<UserModel>(`/user`, user)

  return data
}

export const deleteUser = async (userId: number) => {
  const { data } = await apiClient.delete(`/user/${userId}`)

  return data
}