import {
  getDisplayMediaStream,
  getActionSetDisaplyMediaStream,
  getUserStreamSettings,
  getEncodingSettings,
  getActionSetEncodingSettings,
  getStreamSettings,
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
  bitrateToShortValue,
  bitrateValueText,
} from "../../../utils/FormateBitrate"
import ButtonGroup from "@mui/material/ButtonGroup"
import Button from "@mui/material/Button"
import { Stack } from "@mui/system"
import { VideoStreamSettingsHint } from "@/pages/RoomPage/model/types/RoomRTCSchema"

type ShareScreenMenuProps = {}

export const ShareScreenMenu = (props: ShareScreenMenuProps) => {
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings)
  const encodingSettings = useRoomRTCStore(getEncodingSettings)
  const setDisplayMediaStream = useRoomRTCStore(getActionSetDisaplyMediaStream)
  const setEncodingSettings = useRoomRTCStore(getActionSetEncodingSettings)
  const setStreamingSettings = useRoomRTCStore(
    (state) => state.setStreamSettings
  )

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

  const handleBitrateChange = (
    event: React.SyntheticEvent | Event,
    newValue: number | Array<number>
  ) => {
    if (Array.isArray(newValue)) return
    const settings = encodingSettings
    settings.maxBitrate = newValue * 1024 * 1024
    setEncodingSettings(settings)
  }

  const handleChangeFrameRate = (value: number) => {
    setStreamingSettings({
      video: { ...userStreamSettings.video, frameRate: value },
      audio: userStreamSettings.audio,
    })
  }

  const handleChangeResolution = (value: number) => {
    setStreamingSettings({
      video: { ...userStreamSettings.video, height: value },
      audio: userStreamSettings.audio,
    })
  }
  const handleChangeHint = (value: VideoStreamSettingsHint) => {
    setStreamingSettings({
      video: { ...userStreamSettings.video, hint: value },
      audio: userStreamSettings.audio,
    })
  }

  const currentResolution = userStreamSettings.video.height
  const currentFrameRate = userStreamSettings.video.frameRate
  const currentHint = userStreamSettings.video.hint

  return (
    <>
      {!mediaStream ? (
        <Tooltip title="Share your screen" arrow>
          <IconButton
            aria-label={"Share your screen"}
            onClick={handleStartDisplayMediaStream}
            onContextMenu={handleClick}
          >
            <ScreenShareIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Stop share" arrow>
          <IconButton
            aria-label={"Stop share"}
            onClick={handleStopDisplayMediaStream}
            onContextMenu={handleClick}
          >
            <StopScreenShareIcon />
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
        <Divider />
        <Stack gap={1}>
          <div className={styles.selector}>
            <ButtonGroup fullWidth>
              <Button
                variant={currentHint === "detail" ? "contained" : undefined}
                onClick={() => handleChangeHint("detail")}
              >
                detail
              </Button>
              <Button
                variant={currentHint === "default" ? "contained" : undefined}
                onClick={() => handleChangeHint("default")}
              >
                default
              </Button>
              <Button
                variant={currentHint === "motion" ? "contained" : undefined}
                onClick={() => handleChangeHint("motion")}
              >
                motion
              </Button>
            </ButtonGroup>
          </div>
          <div className={styles.selector}>
            <Typography pl={1}>Frame Rate</Typography>
            <ButtonGroup fullWidth>
              <Button
                variant={currentFrameRate === 5 ? "contained" : undefined}
                onClick={() => handleChangeFrameRate(5)}
              >
                5
              </Button>
              <Button
                variant={currentFrameRate === 30 ? "contained" : undefined}
                onClick={() => handleChangeFrameRate(30)}
              >
                30
              </Button>
              <Button
                variant={currentFrameRate === 60 ? "contained" : undefined}
                onClick={() => handleChangeFrameRate(60)}
              >
                60
              </Button>
            </ButtonGroup>
          </div>
          <div className={styles.selector}>
            <Typography pl={1}>Resolution</Typography>
            <ButtonGroup fullWidth>
              <Button
                variant={currentResolution === 144 ? "contained" : undefined}
                onClick={() => handleChangeResolution(144)}
              >
                144p
              </Button>
              <Button
                variant={currentResolution === 720 ? "contained" : undefined}
                onClick={() => handleChangeResolution(720)}
              >
                720p
              </Button>
              <Button
                variant={currentResolution === 1080 ? "contained" : undefined}
                onClick={() => handleChangeResolution(1080)}
              >
                1080p
              </Button>
            </ButtonGroup>
          </div>

          <div className={styles.slider}>
            <Typography className={styles.sliderLabel}>
              Max bitrate:{" "}
              <span>
                {bitrateToShortValue(encodingSettings.maxBitrate || 0)} Mb/s
              </span>
            </Typography>
            <Slider
              defaultValue={bitrateToShortValue(
                encodingSettings.maxBitrate || 0
              )}
              onChangeCommitted={handleBitrateChange}
              aria-label="bitrate"
              valueLabelDisplay="auto"
              getAriaValueText={bitrateValueText}
              valueLabelFormat={bitrateValueText}
              step={0.1}
              min={0.1}
              max={50}
            />
          </div>
        </Stack>
      </Menu>
    </>
  )
}
