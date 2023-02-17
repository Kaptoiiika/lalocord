import { createAsyncThunk } from "@reduxjs/toolkit"
import { userActions } from "@/entities/User"
import { FormateError } from "@/shared/api/Errors/FormateError/FormateError"
import { AuthRespounce } from "@/shared/api/types/AuthRespounce"
import { ThunkConfig } from "@/shared/config/storeConfig"
import { saveTokenToApi } from "../../../../../shared/api/AuthorizationToken/saveTokenToApi"

interface loginByUsernameOrEmailDTO {
  identifier: string
  password: string
}

export const loginByUsernameOrEmail = createAsyncThunk<
  void,
  loginByUsernameOrEmailDTO,
  ThunkConfig<string>
>(
  "AuthByUsername/loginByUsernameOrEmail",
  async ({ password, identifier }, thunkAPI) => {
    if (!password || !identifier)
      return thunkAPI.rejectWithValue("unknownError")

    const body = { password, identifier }
    try {
      const { data } = await thunkAPI.extra.api.post<AuthRespounce>(
        "/api/auth/local",
        body
      )
      const { user, jwt: token } = data

      thunkAPI.dispatch(
        userActions.setAuthData({
          id: user.id,
          email: user.email,
          username: user.username,
        })
      )
      saveTokenToApi(thunkAPI.extra.api, token)

      return
    } catch (error: any) {
      console.log(error)
      return thunkAPI.rejectWithValue(FormateError(error))
    }
  }
)
