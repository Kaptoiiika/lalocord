import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { initalAuthData } from "../services/initialAuth/initAuthData"
import { logoutUser } from "../services/logoutUser/logoutUser"
import { UserModel, UserSchema } from "../types/userSchema"

const initialState: UserSchema = {
  authData: undefined,
  isInited: false,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<UserModel | undefined>) => {
      state.authData = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.authData = undefined
      })
      .addCase(logoutUser.rejected, (state) => {
        state.authData = undefined
      })
      .addCase(initalAuthData.fulfilled, (state, action) => {
        state.authData = action.payload
        state.isInited = true
      })
      .addCase(initalAuthData.rejected, (state) => {
        state.isInited = true
      })
  },
})

export const { actions: userActions } = userSlice
export const { reducer: userReducer } = userSlice
