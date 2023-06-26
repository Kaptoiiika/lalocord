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
import { useRoomRTCStore } from "@/entities/RTCClient"
import { usePopup } from "@/shared/lib/hooks/usePopup/usePopup"
// import KeyboardIcon from "@mui/icons-material/Keyboard"

type ShareScreenMenuProps = {}

export const ShareScreenMenu = (props: ShareScreenMenuProps) => {
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const setDisplayMediaStream = useRoomRTCStore(getActionSetDisaplyMediaStream)
  const { handleClick, handleClose, anchorEl, open } = usePopup()

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
      console.log(streamSettings)
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
  // const handleStartDisplayWithControllMediaStream = async () => {
  //   handleClose()
  //   Object.values(useRoomRTCStore.getState().connectedUsers).forEach(
  //     (client) => {
  //       client.media.setAllowControl(true)
  //     }
  //   )
  //   if (!mediaStream) await handleStartDisplayMediaStream()
  // }

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
        {/* {__IS_ELECTRON__ && (
          <MenuItem onClick={handleStartDisplayWithControllMediaStream}>
            <ListItemIcon>
              <KeyboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{"Share with control"}</ListItemText>
          </MenuItem>
        )} */}
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
