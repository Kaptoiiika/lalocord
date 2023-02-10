import { io } from "socket.io-client"

export const socketClient = io(__API_URL__ || "", {
  reconnectionDelayMax: 10000,
})
