import { AxiosError } from 'axios'

export const FormateError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiErrorMessage = error.response?.data?.error?.message

    if (apiErrorMessage) return apiErrorMessage

    const status = error?.response?.status
    if (status === 404) {
      return 'Not found'
    }

    return `Error ${status}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown error'
}
