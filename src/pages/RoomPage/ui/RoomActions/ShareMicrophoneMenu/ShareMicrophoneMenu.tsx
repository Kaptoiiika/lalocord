import {
  getStreamSettings,
  getActionSetMicrophoneStream,
  getMicrophoneStream,
} from "@/pages/RoomPage/model/selectors/RoomRTCSelectors"
import { Tooltip, IconButton } from "@mui/material"
import { useCallback } from "react"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import { useRoomRTCStore } from "@/entities/RTCClient"
import Menu from "@mui/material/Menu"
import { usePopup } from "@/shared/lib/hooks/usePopup/usePopup"
import { SelectMicrophone } from "./SelectMicrophone"
// import styles from "./ShareMicrophoneMenu.module.scss"

export const ShareMicrophoneMenu = () => {
  const setMicrophoneStream = useRoomRTCStore(getActionSetMicrophoneStream)
  const microphoneStream = useRoomRTCStore(getMicrophoneStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const { handleClick, handleClose, anchorEl, open } = usePopup()

  const handleStartWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: streamSettings.audio,
      })
      microphoneStream?.getTracks().forEach((tracks) => {
        tracks.onended = null
        tracks.stop()
      })
      setMicrophoneStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setMicrophoneStream(null)
        }
      })
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleStopStream = useCallback(() => {
    microphoneStream?.getTracks().forEach((track) => {
      track.stop()
    })
    setMicrophoneStream(null)
  }, [microphoneStream, setMicrophoneStream])

  return (
    <>
      {!!microphoneStream ? (
        <Tooltip title="Turn off microphone" arrow>
          <IconButton onClick={handleStopStream} onContextMenu={handleClick}>
            <MicIcon color="success" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Turn on microphone" arrow>
          <IconButton
            onClick={handleStartWebCamStream}
            onContextMenu={handleClick}
          >
            <MicOffIcon />
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
        <SelectMicrophone />
      </Menu>
    </>
  )
}
