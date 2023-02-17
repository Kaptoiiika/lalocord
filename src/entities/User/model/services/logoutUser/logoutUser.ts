import { createAsyncThunk } from "@reduxjs/toolkit"
import { deleteTokenFromApi } from "@/shared/api/AuthorizationToken/deleteTokenFromApi"
import type { ThunkConfig } from "@/shared/config/storeConfig"

export const logoutUser = createAsyncThunk<
  undefined,
  void,
  ThunkConfig<string>
>("user/LogoutUser", async (dto, thunkAPI) => {
  try {
    deleteTokenFromApi(thunkAPI.extra.api)

    return undefined
  } catch (error: any) {
    return thunkAPI.rejectWithValue("auth is rejected")
  }
})
