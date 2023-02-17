import { createAsyncThunk } from "@reduxjs/toolkit"
import { userActions } from "@/entities/User"
import { FormateError } from "@/shared/api/Errors/FormateError/FormateError"
import { AuthRespounce } from "@/shared/api/types/AuthRespounce"
import { ThunkConfig } from "@/shared/config/storeConfig"
import { saveTokenToApi } from "../../../../../shared/api/AuthorizationToken/saveTokenToApi"

interface registrationByUsernameDTO {
  username: string
  password: string
  email: string
}

export const registrationByUsername = createAsyncThunk<
  void,
  registrationByUsernameDTO,
  ThunkConfig<string>
>(
  "AuthByUsername/registrationByUsername",
  async ({ password, username, email }, thunkAPI) => {
    if (!password || !username || !email)
      return thunkAPI.rejectWithValue("Missing or invalid credentials")

    const body = { password, username, email }
    try {
      const { data } = await thunkAPI.extra.api.post<AuthRespounce>(
        "/api/auth/local/register",
        body
      )
      const { jwt: token, user } = data

      thunkAPI.dispatch(
        userActions.setAuthData({
          email: user.email,
          id: user.id,
          username: user.username,
        })
      )
      saveTokenToApi(thunkAPI.extra.api, token)

      return
    } catch (error: any) {
      return thunkAPI.rejectWithValue(FormateError(error))
    }
  }
)
