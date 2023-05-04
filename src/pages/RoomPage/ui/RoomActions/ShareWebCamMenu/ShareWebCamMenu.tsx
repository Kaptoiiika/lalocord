import {
  getActionSetWebCamStream,
  getStreamSettings,
  getWebCamStream,
} from "../../../model/selectors/RoomRTCSelectors"
import { IconButton, Tooltip, Stack } from "@mui/material"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import { useCallback } from "react"
import { useRoomRTCStore } from "@/entities/RTCClient"
import { usePopup } from "@/shared/lib/hooks/usePopup/usePopup"
import Menu from "@mui/material/Menu/Menu"
import { SelectCamera } from "./SelectCamera/SelectCamera"

export const ShareWebCamMenu = () => {
  const setWebCamStream = useRoomRTCStore(getActionSetWebCamStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const { handleClick, handleClose, anchorEl, open } = usePopup()

  const handleStartWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: streamSettings.video,
        audio: false,
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
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleStopStream = useCallback(() => {
    webCamStream?.getTracks().forEach((track) => {
      track.stop()
    })
    setWebCamStream(null)
  }, [setWebCamStream, webCamStream])

  return (
    <>
      {!!webCamStream ? (
        <Tooltip title="Turn off camera" arrow>
          <IconButton onClick={handleStopStream} onContextMenu={handleClick}>
            <VideocamIcon color="success" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Turn on camera" arrow>
          <IconButton
            onClick={handleStartWebCamStream}
            onContextMenu={handleClick}
          >
            <VideocamOffIcon />
          </IconButton>
        </Tooltip>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <SelectCamera />
      </Menu>
    </>
  )
}
