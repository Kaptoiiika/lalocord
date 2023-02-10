import { PageWrapper } from "@/widgets/Page"
import { SpeedDial, SpeedDialAction } from "@mui/material"
import { useParams } from "react-router-dom"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import VideocamIcon from "@mui/icons-material/Videocam"
import { useEffect } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import styles from "./RoomPage.module.scss"
import { RoomLobby } from "../RoomLobby/RoomLobby"

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
