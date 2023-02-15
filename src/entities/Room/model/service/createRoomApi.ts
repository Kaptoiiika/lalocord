import { createAsyncThunk } from "@reduxjs/toolkit"
import { FormateError } from "@/shared/api/Errors/FormateError/FormateError"
import { ThunkConfig } from "@/shared/config/storeConfig"

export const createRoomApi = createAsyncThunk<
  void, // return value
  string, // params
  ThunkConfig<string>
>("roomlist/createRoomApi", async (name, thunkApi) => {
  try {
    const body = {
      data: {
        name: name,
      },
    }
    await thunkApi.extra.api.post(`/rooms`, body)

    return
  } catch (e) {
    return thunkApi.rejectWithValue(FormateError(e))
  }
})
