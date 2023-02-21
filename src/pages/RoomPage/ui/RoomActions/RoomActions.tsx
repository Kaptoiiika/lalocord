import { IconButton, Tooltip } from "@mui/material"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import styles from "./RoomActions.module.scss"
import { useState } from "react"
import { useRoomRTCStore } from "../../model/store/store/RoomRTCStore"
import {
  getActionSetWebCamStream,
  getStreamSettings,
  getWebCamStream,
} from "../../model/store/selectors/RoomRTCSelectors"
import { ShareScreenMenu } from "./ShareScreenMenu/ShareScreenMenu"

type RoomActionsProps = {}

export const RoomActions = (props: RoomActionsProps) => {
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const setWebCamStream = useRoomRTCStore(getActionSetWebCamStream)

  const [error, setError] = useState({ usermedia: null })

  const hundleWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: streamSettings,
      })
      setWebCamStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setWebCamStream(null)
        }
      })
    } catch (error: any) {
      setError((prev) => ({ ...prev, usermedia: error?.message }))
    }
  }

  const hundleStopWebCamStream = () => {
    webCamStream?.getTracks().forEach((track) => {
      track.stop()
      setWebCamStream(null)
    })
  }

  return (
    <div className={styles.RoomActions}>
      {webCamStream ? (
        <Tooltip title="Turn off camera" arrow>
          <IconButton
            onClick={hundleStopWebCamStream}
            aria-label={"Turn off camera"}
          >
            <VideocamOffIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Turn on camera" arrow>
          <IconButton
            onClick={hundleWebCamStream}
            aria-label={error.usermedia || "Turn on camera"}
            disabled={!!error.usermedia}
          >
            <VideocamIcon />
          </IconButton>
        </Tooltip>
      )}

      <ShareScreenMenu />
    </div>
  )
}
