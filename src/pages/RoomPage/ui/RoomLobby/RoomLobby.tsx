import { socketClient } from "@/shared/api/socket/socket"
import { Chat } from "@/widgets/Chat"
import { Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { useWebRTCRoom } from "../../lib/useWebRTCRoom/useWebRTCRoom"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomIsFull } from "../RoomIsFull/RoomIsFull"
import { RoomStreams } from "../RoomStreams/RoomStreams"
import { RoomUsers } from "../RoomUsers/RoomUsers"
import { WaitUserClick } from "../WaitUserClick/WaitUserClick"
import styles from "./RoomLobby.module.scss"

export const RoomLobby = () => {
  const { handleSendMessage, handleSendBlob } = useWebRTCRoom()
  const [roomisFull, setRoomIsfull] = useState(false)

  useEffect(() => {
    socketClient.on("room_is_full", () => {
      setRoomIsfull(true)
    })
    return () => {
      socketClient.off("room_is_full", () => {})
    }
  }, [])

  if (roomisFull) {
    return <RoomIsFull />
  }

  return (
    <WaitUserClick>
      <Stack justifyContent="space-between" direction="row" height="100%">
        <div className={styles.mainScreen}>
          <RoomUsers />
          <RoomStreams />
          <RoomActions />
        </div>

        <Chat onSendMessage={handleSendMessage} onSendFile={handleSendBlob} />
      </Stack>
    </WaitUserClick>
  )
}
