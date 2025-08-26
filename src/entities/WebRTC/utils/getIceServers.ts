const VITE_ICE_SERVER = import.meta.env.VITE_ICE_SERVER
const VITE_ICE_USERNAME = import.meta.env.VITE_ICE_USERNAME
const VITE_ICE_PASSWORD = import.meta.env.VITE_ICE_PASSWORD

export const getIceServers = (): RTCIceServer[] => {
  const stunServers = VITE_ICE_SERVER
    ? [
        {
          urls: `stun:${VITE_ICE_SERVER}:5349`,
        },
        {
          urls: `stun:${VITE_ICE_SERVER}:3478`,
        },
      ]
    : []

  const turnServers = VITE_ICE_SERVER && VITE_ICE_USERNAME && VITE_ICE_PASSWORD
    ? [
        {
          urls: [`turn:${VITE_ICE_SERVER}:5349`, `turn:${VITE_ICE_SERVER}:3478`],
          username: VITE_ICE_USERNAME,
          credential: VITE_ICE_PASSWORD,
        },
      ]
    : []

  return [
    ...stunServers,
    ...turnServers,
  ]
}
