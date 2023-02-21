import {
  getDisplayMediaStream,
  getActionSetDisaplyMediaStream,
  getStreamSettings,
  getEncodingSettings,
  getActionSetEncodingSettings,
} from "../../../model/store/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../../model/store/store/RoomRTCStore"
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Slider,
  Typography,
} from "@mui/material"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import styles from "./ShareScreenMenu.module.scss"
import { MouseEvent, useState } from "react"

type ShareScreenMenuProps = {}

function bitrateValueText(value: number) {
  return `${value} Mb/s`
}
function bitrateToShortValue(value: number): number {
  return value / 1024 / 1024
}
function PriorityValueText(value: number): RTCPriorityType {
  switch (value) {
    case 4:
      return "high"
    case 3:
      return "medium"
    case 2:
      return "low"
    case 1:
      return "very-low"
  }
  return "low"
}
function PriorityTextToNumber(value?: string): number {
  switch (value) {
    case "high":
      return 4
    case "medium":
      return 3
    case "low":
      return 2
    case "very-low":
      return 1
  }
  return 2
}

export const ShareScreenMenu = (props: ShareScreenMenuProps) => {
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const encodingSettings = useRoomRTCStore(getEncodingSettings)
  const setDisplayMediaStream = useRoomRTCStore(getActionSetDisaplyMediaStream)
  const setEncodingSettings = useRoomRTCStore(getActionSetEncodingSettings)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const hundleStopDisplayMediaStream = () => {
    handleClose()
    mediaStream?.getTracks().forEach((track) => {
      track.stop()
      setDisplayMediaStream(null)
    })
  }

  const hundleStartDisplayMediaStream = async () => {
    handleClose()
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          autoGainControl: false,
        },
        video: streamSettings,
      })
      setDisplayMediaStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setDisplayMediaStream(null)
        }
      })
    } catch (error: any) {}
  }

  const hundlePriotryChange = (
    event: React.SyntheticEvent | Event,
    newValue: number | Array<number>
  ) => {
    if (Array.isArray(newValue)) return
    const settings = encodingSettings
    settings.priority = PriorityValueText(newValue)

    setEncodingSettings(settings)
  }
  const hundleBitrateChange = (
    event: React.SyntheticEvent | Event,
    newValue: number | Array<number>
  ) => {
    if (Array.isArray(newValue)) return
    const settings = encodingSettings
    settings.maxBitrate = newValue * 1024 * 1024
    setEncodingSettings(settings)
  }

  return (
    <>
      <Tooltip title="Share your screen" arrow>
        <IconButton aria-label={"Share your screen"} onClick={handleClick}>
          <ScreenShareIcon />
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
        <MenuItem onClick={hundleStartDisplayMediaStream}>
          <ListItemIcon>
            <ScreenShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {mediaStream ? "Change screen" : "Share your screen"}
          </ListItemText>
        </MenuItem>
        {!!mediaStream && (
          <MenuItem onClick={hundleStopDisplayMediaStream}>
            <ListItemIcon>
              <StopScreenShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Stop share</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <div className={styles.slider}>
          <Typography>
            Bitrate: {bitrateToShortValue(encodingSettings.maxBitrate || 0)}{" "}
            Mb/s
          </Typography>
          <Slider
            defaultValue={bitrateToShortValue(encodingSettings.maxBitrate || 0)}
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
          <Typography>Priority: {encodingSettings.priority}</Typography>
          <Slider
            value={PriorityTextToNumber(encodingSettings.priority)}
            onChange={hundlePriotryChange}
            aria-label="Priority"
            getAriaValueText={PriorityValueText}
            step={1}
            min={1}
            max={4}
          />
        </div>
      </Menu>
    </>
  )
}
