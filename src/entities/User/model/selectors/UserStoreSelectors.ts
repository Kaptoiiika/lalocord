import type { UserSchema } from '../types/UserSchema';

export const getLocalUser = (state: UserSchema) => state.localUser;
