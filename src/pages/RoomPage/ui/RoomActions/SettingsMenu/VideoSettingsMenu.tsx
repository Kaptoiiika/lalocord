import { MouseEvent, useState } from "react"
import { VideoStreamSettingsHint } from "@/entities/RTCClient/model/types/RoomRTCSchema"
import {
  useRoomRTCStore,
  bitrateToShortValue,
  bitrateValueText,
} from "@/entities/RTCClient"
import {
  getUserStreamSettings,
  getEncodingSettings,
  getActionSetEncodingSettings,
} from "@/entities/RTCClient/model/selectors/RoomRTCSelectors"
import { Menu, Stack, Typography, Slider } from "@mui/material"
import IconButton from "@mui/material/IconButton/IconButton"
import Tooltip from "@mui/material/Tooltip"
import styles from "./VideoSettingsMenu.module.scss"
import SettingsIcon from "@mui/icons-material/Settings"
import { InlineSelect } from "@/shared/ui/InlineSelect/InlineSelect"
import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"

type VideoSettingsMenuProps = {}

export const VideoSettingsMenu = (props: VideoSettingsMenuProps) => {
  const {} = props
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings)
  const experementalVideo = useRoomRTCStore(
    (state) => state.experementalEncdoing
  )
  const setExperementalVideo = useRoomRTCStore(
    (state) => state.setExperementalEncdoing
  )
  const encodingSettings = useRoomRTCStore(getEncodingSettings)
  const setEncodingSettings = useRoomRTCStore(getActionSetEncodingSettings)
  const setStreamingSettings = useRoomRTCStore(
    (state) => state.setStreamSettings
  )
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
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

  const handleSetExpVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExperementalVideo(e.currentTarget.checked)
  }

  const currentResolution = userStreamSettings.video.height
  const currentFrameRate = userStreamSettings.video.frameRate
  const currentHint = userStreamSettings.video.hint

  return (
    <>
      <Tooltip title="Settings" arrow>
        <IconButton aria-label={"Settings"} onClick={handleOpen}>
          <SettingsIcon />
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
        <Stack gap={1}>
          <InlineSelect
            value={currentHint}
            list={["detail", "default", "motion"]}
            onSelect={handleChangeHint}
          />
          <InlineSelect
            title={"Frame Rate"}
            value={currentFrameRate}
            list={[5, 30, 60]}
            onSelect={handleChangeFrameRate}
          />
          <InlineSelect
            title={"Resolution"}
            value={currentResolution}
            list={[144, 720, 1080]}
            onSelect={handleChangeResolution}
          />

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
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={!!experementalVideo}
                onChange={handleSetExpVideo}
              />
            }
            label="experemental Encoding"
          />
        </Stack>
      </Menu>
    </>
  )
}
