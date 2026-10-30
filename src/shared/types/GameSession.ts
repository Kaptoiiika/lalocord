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

export type GameCaptureSettings = {
  width: number
  height: number
  frameRate: number
  bitrate: number
}

const isCaptureNumber = (value: unknown, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= max

export const isGameCaptureSettings = (value: unknown): value is GameCaptureSettings => {
  if (typeof value !== 'object' || value === null) return false

  const settings = value as GameCaptureSettings

  return (
    isCaptureNumber(settings.width, 7680) &&
    isCaptureNumber(settings.height, 4320) &&
    isCaptureNumber(settings.frameRate, 240) &&
    isCaptureNumber(settings.bitrate, 50 * 1024 * 1024)
  )
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
