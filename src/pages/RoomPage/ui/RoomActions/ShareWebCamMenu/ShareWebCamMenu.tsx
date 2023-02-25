import {
  getActionSetWebCamStream,
  getStreamSettings,
  getWebCamStream,
} from "../../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../../model/store/RoomRTCStore"
import { IconButton, Tooltip } from "@mui/material"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"

export const ShareWebCamMenu = () => {
  const setWebCamStream = useRoomRTCStore(getActionSetWebCamStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)

  const hundleStartWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: streamSettings.video,
      })
      webCamStream?.getTracks().forEach((tracks) => {
        tracks.onended = null
        tracks.stop()
      })
      setWebCamStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setWebCamStream(null)
        }
      })
    } catch (error: any) {}
  }

  const hundleStopStream = () => {
    webCamStream?.getTracks().forEach((track) => {
      track.stop()
    })
    setWebCamStream(null)
  }

  return (
    <>
      {!!webCamStream ? (
        <Tooltip title="Turn on camera" arrow>
          <IconButton onClick={hundleStopStream}>
            <VideocamOffIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Turn off camera" arrow>
          <IconButton onClick={hundleStartWebCamStream}>
            <VideocamIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  )
}
