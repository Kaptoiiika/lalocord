import { PageWrapper } from "@/widgets/Page"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import { RoomLobby } from "../RoomLobby/RoomLobby"
import { useUserStore } from "@/entities/User"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"

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

    return () => {
      leaveRoom()
      fn()
    }
  }, [id, joinToRoom, leaveRoom])

  return (
    <PageWrapper>
      <RoomLobby />
    </PageWrapper>
  )
}
