import { Stack } from "@mui/material"
import { useWebRTCRoom } from "../../lib/useWebRTCRoom/useWebRTCRoom"
import { getRoomUsers } from "../../model/store/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/store/RoomRTCStore"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomChat } from "../RoomChat/RoomChat"
import { RoomStreams } from "../RoomStreams/RoomStreams"
import { RoomUsers } from "../RoomUsers/RoomUsers"
import styles from "./RoomLobby.module.scss"

export const RoomLobby = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const { hundleSendMessage, messages } = useWebRTCRoom()

  const userList = Object.values(users)

  return (
    <Stack justifyContent="space-between" direction="row" height="100%">
      <div className={styles.mainScreen}>
        <RoomUsers users={userList} />
        <RoomStreams />
        <RoomActions />
      </div>

      <RoomChat onSendMessage={hundleSendMessage} messages={messages} />
    </Stack>
  )
}
