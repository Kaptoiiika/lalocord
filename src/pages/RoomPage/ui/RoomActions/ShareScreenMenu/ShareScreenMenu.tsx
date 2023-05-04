import {
  getActionSetDisaplyMediaStream,
  getDisplayMediaStream,
  getStreamSettings,
} from "../../../model/selectors/RoomRTCSelectors"
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import { MouseEvent, useState } from "react"
import { useRoomRTCStore } from "@/entities/RTCClient"

type ShareScreenMenuProps = {}

export const ShareScreenMenu = (props: ShareScreenMenuProps) => {
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const setDisplayMediaStream = useRoomRTCStore(getActionSetDisaplyMediaStream)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleStopDisplayMediaStream = () => {
    handleClose()
    mediaStream?.getTracks().forEach((track) => {
      track.stop()
    })
    setDisplayMediaStream(null)
  }

  const handleStartDisplayMediaStream = async () => {
    handleClose()
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(
        streamSettings
      )
      mediaStream?.getTracks().forEach((tracks) => {
        tracks.onended = null
        tracks.stop()
      })
      setDisplayMediaStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setDisplayMediaStream(null)
        }
      })
    } catch (error: any) {
      console.log(error)
    }
  }

  return (
    <>
      {!mediaStream ? (
        <Tooltip title="Share your screen" arrow>
          <IconButton
            aria-label={"Share your screen"}
            onClick={handleStartDisplayMediaStream}
            onContextMenu={handleClick}
          >
            <StopScreenShareIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Stop share" arrow>
          <IconButton
            aria-label={"Stop share"}
            onClick={handleStopDisplayMediaStream}
            onContextMenu={handleClick}
          >
            <ScreenShareIcon color="success" />
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
        <MenuItem onClick={handleStartDisplayMediaStream}>
          <ListItemIcon>
            <ScreenShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {mediaStream ? "Change screen" : "Share your screen"}
          </ListItemText>
        </MenuItem>
        {!!mediaStream && (
          <MenuItem onClick={handleStopDisplayMediaStream}>
            <ListItemIcon>
              <StopScreenShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Stop share</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
