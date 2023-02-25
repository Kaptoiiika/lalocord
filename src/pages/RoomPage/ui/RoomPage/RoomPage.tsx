import { PageWrapper } from "@/widgets/Page"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import { RoomLobby } from "../RoomLobby/RoomLobby"
import { useUserStore } from "@/entities/User"
import styles from "./RoomPage.module.scss"

export const RoomPage = () => {
  const localuser = useUserStore((state) => state.localUser)
  const { id = "" } = useParams()

  useEffect(() => {
    if (id) {
      socketClient.emit("join", { name: id, username: localuser.username })
    }

    return () => {
      socketClient.emit("leave", { name: id })
    }
  }, [id, localuser.username])

  return (
    <PageWrapper>
      <RoomLobby />
    </PageWrapper>
  )
}
