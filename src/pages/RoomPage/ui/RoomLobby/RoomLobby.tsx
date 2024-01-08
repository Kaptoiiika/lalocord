import { socketClient } from "@/shared/api/socket/socket"
import { Chat } from "@/widgets/Chat"
import { Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { useWebRTCRoom } from "../../lib/useWebRTCRoom/useWebRTCRoom"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomIsFull } from "../RoomIsFull/RoomIsFull"
import { RoomStreams } from "../RoomStreams/RoomStreams"
import { RoomUsers } from "../RoomUsers/RoomUsers"
import { WaitUserClick } from "@/features/WaitUserClick"
import styles from "./RoomLobby.module.scss"

export const RoomLobby = () => {
  const { handleSendMessage, handleSendBlob } = useWebRTCRoom()
  const [roomisFull, setRoomIsfull] = useState(false)

  useEffect(() => {
    const fn = () => {
      setRoomIsfull(true)
    }
    socketClient.on("room_is_full", fn)
    return () => {
      socketClient.off("room_is_full", fn)
    }
  }, [])

  if (roomisFull) {
    return <RoomIsFull />
  }

  return (
    <WaitUserClick>
      <Stack className={styles.lobby} justifyContent="space-between" height="100%">
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
