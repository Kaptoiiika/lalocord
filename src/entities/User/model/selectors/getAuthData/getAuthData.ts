import type { StateSchema } from "@/shared/config/storeConfig"

export const getAuthData = (state: StateSchema) =>
  state.user.authData || undefined

export const getAuthIsInited = (state: StateSchema) =>
  state.user.isInited
