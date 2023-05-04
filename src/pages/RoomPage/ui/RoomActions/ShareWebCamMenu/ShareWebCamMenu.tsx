import {
  getActionStartWebCamStream,
  getActionStopWebCamStream,
  getWebCamStream,
} from "../../../model/selectors/RoomRTCSelectors"
import { IconButton, Tooltip } from "@mui/material"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import { useCallback } from "react"
import { useRoomRTCStore } from "@/entities/RTCClient"
import { usePopup } from "@/shared/lib/hooks/usePopup/usePopup"
import Menu from "@mui/material/Menu/Menu"
import { SelectCamera } from "./SelectCamera/SelectCamera"

export const ShareWebCamMenu = () => {
  const startStream = useRoomRTCStore(getActionStartWebCamStream)
  const stopStream = useRoomRTCStore(getActionStopWebCamStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
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
