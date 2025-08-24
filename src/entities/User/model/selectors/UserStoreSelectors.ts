import type { LocalUserSchema } from '../store/LocalUserStore'

export const getLocalUser = (state: LocalUserSchema) => state.localUser
