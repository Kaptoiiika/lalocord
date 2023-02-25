import {
  getActionSetWebCamStream,
  getStreamSettings,
  getWebCamStream,
} from "../../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../../model/store/RoomRTCStore"
import {
  Tooltip,
  IconButton,
  Menu,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material"
import { MouseEvent, useState } from "react"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import SwitchCameraIcon from "@mui/icons-material/SwitchCamera"

type FacingMode = "user" | "environment"
export const ShareWebCamMenu = () => {
  const setWebCamStream = useRoomRTCStore(getActionSetWebCamStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const [facingMode, setFacingMode] = useState<FacingMode>("user")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [error, setError] = useState({ usermedia: null })
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const hundleStartStream = () => {
    hundleStartWebCamStream(facingMode)
  }

  const hundleStartWebCamStream = async (facing: FacingMode) => {
    handleClose()
    try {
      const constraints =
        typeof streamSettings.video === "boolean"
          ? {}
          : { ...streamSettings.video }
      constraints.facingMode = facing
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints,
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
      setError((prev) => ({ ...prev, usermedia: error?.message }))
    }
  }

  const hundleSwitchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newMode)
    if (webCamStream) hundleStartWebCamStream(newMode)
  }

  const hundleStopStream = () => {
    handleClose()
    webCamStream?.getTracks().forEach((track) => {
      track.stop()
    })
    setWebCamStream(null)
  }

  return (
    <>
      <Tooltip title="Turn on camera" arrow>
        <IconButton
          onClick={handleClick}
          aria-label={error.usermedia || "Turn on camera"}
          disabled={!!error.usermedia}
        >
          <VideocamIcon />
        </IconButton>
      </Tooltip>
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
        {!!webCamStream ? (
          <MenuItem onClick={hundleStopStream}>
            <ListItemIcon>
              <VideocamOffIcon />
            </ListItemIcon>
            <ListItemText>Turn off camera</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={hundleStartStream}>
            <ListItemIcon>
              <VideocamIcon />
            </ListItemIcon>
            <ListItemText>Turn on camera</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={hundleSwitchCamera}>
          <ListItemIcon>
            <SwitchCameraIcon />
          </ListItemIcon>
          <ListItemText>Switch camera</ListItemText>
        </MenuItem>
        {/* <div className={styles.slider}>
          <Typography className={styles.sliderLabel}>
            Bitrate:{" "}
            <span>
              {bitrateToShortValue(encodingSettings.maxBitrate || 0)} Mb/s
            </span>
          </Typography>
          <Slider
            defaultValue={bitrate}
            onChangeCommitted={hundleBitrateChange}
            aria-label="bitrate"
            valueLabelDisplay="auto"
            getAriaValueText={bitrateValueText}
            valueLabelFormat={bitrateValueText}
            step={0.1}
            min={0.1}
            max={50}
          />
        </div>
        <div className={styles.slider}>
          <Typography className={styles.sliderLabel}>
            Priority: <span>{encodingSettings.priority}</span>
          </Typography>
          <Slider
            value={PriorityTextToNumber(encodingSettings.priority)}
            onChange={hundlePriotryChange}
            aria-label="Priority"
            getAriaValueText={PriorityNumberToText}
            step={1}
            min={1}
            max={4}
          />
        </div> */}
      </Menu>
    </>
  )
}
