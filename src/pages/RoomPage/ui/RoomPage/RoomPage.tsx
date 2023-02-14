import { PageWrapper } from "@/widgets/Page"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import { RoomLobby } from "../RoomLobby/RoomLobby"
import styles from "./RoomPage.module.scss"

export const RoomPage = () => {
  const { id = "" } = useParams()

  useEffect(() => {
    if (id) {
      socketClient.emit("join", { name: id })
    }

    return () => {
      socketClient.emit("leave", { name: id })
    }
  }, [id])

  return (
    <PageWrapper>
      <RoomLobby />
    </PageWrapper>
  )
}
