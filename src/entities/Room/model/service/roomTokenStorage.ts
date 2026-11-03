import { localstorageKeys } from 'src/shared/const/localstorageKeys'

const readRoomTokens = () => {
  const json = localStorage.getItem(localstorageKeys.ROOM_TOKENS)

  if (!json) return {}

  try {
    const data: unknown = JSON.parse(json)

    if (typeof data !== 'object' || data === null || Array.isArray(data)) return {}

    return Object.entries(data).reduce<Record<string, string>>((tokens, [roomId, token]) => {
      if (typeof token === 'string' && token.length > 0) {
        tokens[roomId] = token
      }

      return tokens
    }, {})
  } catch {
    return {}
  }
}

const writeRoomTokens = (tokens: Record<string, string>) => {
  localStorage.setItem(localstorageKeys.ROOM_TOKENS, JSON.stringify(tokens))
}

export const getRoomToken = (roomId: string) => readRoomTokens()[roomId]

export const saveRoomToken = (roomId: string, token: string) => {
  const tokens = readRoomTokens()
  tokens[roomId] = token
  writeRoomTokens(tokens)
}

export const removeRoomToken = (roomId: string) => {
  const tokens = readRoomTokens()
  delete tokens[roomId]
  writeRoomTokens(tokens)
}
