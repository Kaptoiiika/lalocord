import { StateSchema } from "@/shared/config/storeConfig"
import { authByUsernameInitial } from "../../slice/AuthByUsernameSlice"

export const getAuthByUsernameState = (state: StateSchema) =>
  state.authByUsername || authByUsernameInitial
