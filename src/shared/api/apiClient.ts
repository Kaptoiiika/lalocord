import axios from "axios"

export const apiClient = axios.create({
  baseURL: __API_URL__ || "",
  headers: {},
})
