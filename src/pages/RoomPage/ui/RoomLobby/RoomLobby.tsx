import { Stack } from "@mui/material"
import { useWebRTCRoom } from "../../lib/useWebRTCRoom/useWebRTCRoom"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomChat } from "../RoomChat/RoomChat"
import { RoomStreams } from "../RoomStreams/RoomStreams"
import { RoomUsers } from "../RoomUsers/RoomUsers"
import styles from "./RoomLobby.module.scss"

export const RoomLobby = () => {
  const { hundleSendMessage, messages } = useWebRTCRoom()

  return (
    <Stack justifyContent="space-between" direction="row" height="100%">
      <div className={styles.mainScreen}>
        <RoomUsers />
        <RoomStreams />
        <RoomActions />
      </div>

      <RoomChat onSendMessage={hundleSendMessage} messages={messages} />
    </Stack>
  )
}
