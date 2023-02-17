export { FormateAtributedUser } from "./model/services/FormatedUser/FormatedUser"

export {
  getAuthIsInited,
  getAuthData,
} from "./model/selectors/getAuthData/getAuthData"

export { initalAuthData } from "./model/services/initialAuth/initAuthData"

export { userActions, userReducer } from "./model/slice/userSlice"
export type { UserSchema, UserModel } from "./model/types/userSchema"
