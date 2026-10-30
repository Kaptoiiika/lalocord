export type GameSessionOffer = {
  url: string
  token: string
  certHash: string
}

export type GameSessionStats = {
  encoder: string
  fps: number
  viewers: number
}

export const isGameSessionOffer = (value: unknown): value is GameSessionOffer => {
  if (typeof value !== 'object' || value === null) return false

  const offer = value as GameSessionOffer

  return (
    typeof offer.url === 'string' &&
    offer.url.length > 0 &&
    typeof offer.token === 'string' &&
    offer.token.length > 0 &&
    typeof offer.certHash === 'string' &&
    offer.certHash.length > 0
  )
}
