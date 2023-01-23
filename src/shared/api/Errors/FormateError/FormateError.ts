export const FormateError = (error: any) => {
  return error?.response?.data?.error?.message || error?.message || "unknownError"
}
