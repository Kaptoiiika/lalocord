import {
  getMicrophoneStream,
  getActionStartMicrophoneStream,
  getActionStopMicrophoneStream,
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
  const startStream = useRoomRTCStore(getActionStartMicrophoneStream)
  const stopStream = useRoomRTCStore(getActionStopMicrophoneStream)
  const microphoneStream = useRoomRTCStore(getMicrophoneStream)
  const { handleClick, handleClose, anchorEl, open } = usePopup()

  const handleStartWebCamStream = async () => {
    try {
      startStream()
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleStopStream = useCallback(() => {
    stopStream()
  }, [stopStream])

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
