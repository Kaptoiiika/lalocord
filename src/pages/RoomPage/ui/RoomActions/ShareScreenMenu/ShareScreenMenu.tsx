import {
  getDisplayMediaStream,
  getActionSetDisaplyMediaStream,
  getStreamSettings,
  getEncodingSettings,
  getActionSetEncodingSettings,
} from "../../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../../model/store/RoomRTCStore"
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
import {
  PriorityNumberToText,
  PriorityTextToNumber,
} from "../../../utils/FormatePriority"
import {
  bitrateToShortValue,
  bitrateValueText,
} from "../../../utils/FormateBitrate"

type ShareScreenMenuProps = {}

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
    })
    setDisplayMediaStream(null)
  }

  const hundleStartDisplayMediaStream = async () => {
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

  const hundlePriotryChange = (
    event: React.SyntheticEvent | Event,
    newValue: number | Array<number>
  ) => {
    if (Array.isArray(newValue)) return
    const settings = encodingSettings
    settings.priority = PriorityNumberToText(newValue)
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
          <Typography className={styles.sliderLabel}>
            Bitrate:{" "}
            <span>
              {bitrateToShortValue(encodingSettings.maxBitrate || 0)} Mb/s
            </span>
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
        </div>
      </Menu>
    </>
  )
}
