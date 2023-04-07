import { PageWrapper } from "@/widgets/Page"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import { RoomLobby } from "../RoomLobby/RoomLobby"
import { useUserStore } from "@/entities/User"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { RoomIsFull } from "../RoomIsFull/RoomIsFull"

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
  const [roomisFull, setRoomIsfull] = useState(false)

  useEffect(() => {
    joinToRoom(id)
    const fn = emitToJoinRoom(id)
    const prevName = document.title
    document.title = `${document.title} - ${id}`
    socketClient.on("room_is_full", () => {
      setRoomIsfull(true)
    })

    return () => {
      document.title = prevName
      leaveRoom()
      socketClient.off("room_is_full", () => {})
      fn()
    }
  }, [id, joinToRoom, leaveRoom])

  if (roomisFull) {
    return (
      <PageWrapper>
        <RoomIsFull />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <RoomLobby />
    </PageWrapper>
  )
}
