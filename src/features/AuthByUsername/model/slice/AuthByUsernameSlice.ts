import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { loginByUsernameOrEmail } from "../services/loginByUsernameOrEmail/loginByUsernameOrEmail"
import { registrationByUsername } from "../services/registrationByUsernameAndEmail/registrationByUsernameAndEmail"
import { AuthByUsernameSchema } from "../types/AuthByUsernameSchema"

export const authByUsernameInitial: AuthByUsernameSchema = {
  username: "",
  password: "",
  email: "",
  identifier: "",

  isloading: false,
}

export const authByUsernameSlice = createSlice({
  name: "profile",
  initialState: authByUsernameInitial,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setIdentifier: (state, action: PayloadAction<string>) => {
      state.identifier = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginByUsernameOrEmail.pending, (state) => {
        state.isloading = true
      })
      .addCase(loginByUsernameOrEmail.fulfilled, (state) => {
        state.isloading = false
        state.loginError = undefined
      })
      .addCase(loginByUsernameOrEmail.rejected, (state, action) => {
        state.isloading = false
        state.loginError = action.payload
      })
      .addCase(registrationByUsername.pending, (state) => {
        state.isloading = true
      })
      .addCase(registrationByUsername.fulfilled, (state) => {
        state.isloading = false
        state.registrationError = undefined
      })
      .addCase(registrationByUsername.rejected, (state, action) => {
        state.isloading = false
        state.registrationError = action.payload
      })
  },
})

export const { actions: authByUsernameSliceActions } = authByUsernameSlice
export const { reducer: authByUsernameSliceReducer } = authByUsernameSlice
