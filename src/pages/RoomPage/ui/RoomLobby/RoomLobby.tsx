import { Stack } from "@mui/system"
import { useWebRTCRoom } from "../../lib/useWebRTCRoom/useWebRTCRoom"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomChat } from "../RoomChat/RoomChat"
import { RoomStreams } from "../RoomStreams/RoomStreams"
import styles from "./RoomLobby.module.scss"

export const RoomLobby = () => {
  const {
    hundleSendMessage,
    hundleStartLocalStream,
    localStream,
    messages,
    users,
  } = useWebRTCRoom()

  return (
    <Stack justifyContent="space-between" direction="row" height="100%">
      <div className={styles.mainScreen}>
        <RoomStreams users={users} localStream={localStream} />
        <RoomActions
          startWebCamStream={hundleStartLocalStream}
          startDisplayMediaStream={hundleStartLocalStream}
        />
      </div>

      <RoomChat onSendMessage={hundleSendMessage} messages={messages} />
    </Stack>
  )
}
