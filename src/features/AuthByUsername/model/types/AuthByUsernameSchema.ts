export interface AuthByUsernameSchema {
  password: string
  username: string
  identifier: string
  email?: string

  isloading: boolean
  loginError?: string
  registrationError?: string
}
