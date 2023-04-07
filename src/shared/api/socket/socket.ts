import { io } from "socket.io-client"

const url = new URL(__API_URL__ || "", window.location.origin)

export const socketClient = io(url.origin, {
  path: url.pathname === "/" ? "" : url.pathname + "/socket.io",
  reconnectionDelayMax: 10000,
  autoConnect: true,
  transports: ["websocket"],
})
