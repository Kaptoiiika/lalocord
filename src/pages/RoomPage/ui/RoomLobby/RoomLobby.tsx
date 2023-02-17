import { Stack } from "@mui/material"
import { useWebRTCRoom } from "../../lib/useWebRTCRoom/useWebRTCRoom"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomChat } from "../RoomChat/RoomChat"
import { RoomStreams } from "../RoomStreams/RoomStreams"
import { RoomUsers } from "../RoomUsers/RoomUsers"
import styles from "./RoomLobby.module.scss"

export const RoomLobby = () => {
  const {
    hundleSendMessage,
    hundleStartLocalStream,
    hundleStopLocalStream,
    localStream,
    messages,
    users,
  } = useWebRTCRoom()

  return (
    <Stack justifyContent="space-between" direction="row" height="100%">
      <div className={styles.mainScreen}>
        <RoomUsers users={users} />
        <RoomStreams users={users} localStream={localStream} />
        <RoomActions
          startWebCamStream={hundleStartLocalStream}
          startDisplayMediaStream={hundleStartLocalStream}
          // eslint-disable-next-line react/jsx-no-leaked-render
          stopStream={localStream ? hundleStopLocalStream : undefined}
        />
      </div>

      <RoomChat onSendMessage={hundleSendMessage} messages={messages} />
    </Stack>
  )
}
