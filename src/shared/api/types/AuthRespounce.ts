export interface AuthRespounce {
  jwt: string
  user: {
    id: number
    username: string
    email: string
    provider: string
    createdAt: string
    updatedAt: string
    confirmed: boolean
    blocked: boolean
  }
}
