import { PageWrapper } from "@/widgets/Page"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import { RoomLobby } from "../RoomLobby/RoomLobby"
import { useUserStore } from "@/entities/User"
import { useRoomRTCStore } from "@/entities/RTCClient"

const emitToJoinRoom = (id: string) => {
  const username = useUserStore.getState().localUser.username
  socketClient.emit("join", {
    name: id,
    username: username,
  })

  return () => {
    useRoomRTCStore.getState().leaveRoom()
    socketClient.emit("leave", { name: id })
  }
}

export const RoomPage = () => {
  const { id = "" } = useParams()
  const joinToRoom = useRoomRTCStore((state) => state.joinRoom)
  const leaveRoom = useRoomRTCStore((state) => state.leaveRoom)

  useEffect(() => {
    joinToRoom(id)
    const fn = emitToJoinRoom(id)
    const prevName = document.title
    document.title = `${document.title} - ${id}`

    return () => {
      document.title = prevName
      leaveRoom()
      socketClient.off("room_is_full", () => {})
      fn()
    }
  }, [id, joinToRoom, leaveRoom])

  useEffect(() => {
    let isConnected = socketClient.active

    const handleConnect = () => {
      if (isConnected === false) {
        const username = useUserStore.getState().localUser.username
        socketClient.emit("join", {
          name: id,
          username: username,
        })
      }
      isConnected = true
    }
    
    const handleDisconnect = () => {
      isConnected = false
    }

    socketClient.on("connect", handleConnect)
    socketClient.on("disconnect", handleDisconnect)
    return () => {
      socketClient.off("connect", handleConnect)
      socketClient.off("disconnect", handleDisconnect)
    }
  }, [id])

  return (
    <PageWrapper>
      <RoomLobby />
    </PageWrapper>
  )
}
