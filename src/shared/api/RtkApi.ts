import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"

export const rtkApi = createApi({
  reducerPath: "rtkApi",
  baseQuery: fetchBaseQuery({
    baseUrl: __API_URL__ || "",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(localstorageKeys.TOKEN)
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: () => ({}),
})
