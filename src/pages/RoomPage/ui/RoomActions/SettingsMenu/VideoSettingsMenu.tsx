import type { MouseEvent } from 'react'
import { useState } from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import { Menu, Stack, Typography, Slider, IconButton, Tooltip } from '@mui/material'
import { bitrateToShortValue, bitrateValueText } from 'src/entities/RTCClient'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { InlineSelectPrimitive } from 'src/shared/ui/InlineSelect/InlineSelectPrimitive'

import styles from './VideoSettingsMenu.module.scss'

export const VideoSettingsMenu = () => {
  const bitrate = useWebRTCStore((state) => state.bitrate)
  const setBitrate = useWebRTCStore((state) => state.setBitrate)
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleBitrateChange = (event: React.SyntheticEvent | Event, newValue: number | Array<number>) => {
    if (Array.isArray(newValue)) return
    setBitrate(newValue * 1024 * 1024)
  }

  const handleChangeFrameRate = (value: string) => {
    const numValue = Number(value)

    if (!numValue) return
    setStreamConstraints({
      video: {
        ...streamConstraints.video,
        frameRate: numValue,
      },
      audio: streamConstraints.audio,
    })
  }

  const handleChangeResolution = (value: string) => {
    const numValue = Number(value)

    if (!numValue) return
    setStreamConstraints({
      video: {
        ...streamConstraints.video,
        height: numValue,
      },
      audio: streamConstraints.audio,
    })
  }

  const currentFrameRate = streamConstraints.video.frameRate

  const frameRateList = ['5', '30', '60']
  const isCustomFrameRate = frameRateList.includes(String(currentFrameRate)) ? '90' : `${currentFrameRate}`

  const currentResolution = streamConstraints.video?.height
  const resolutionList = ['144', '720', '1080']
  const isCustomResolution = resolutionList.includes(String(currentResolution)) ? '1440' : `${currentResolution}`

  return (
    <>
      <Tooltip
        title="Settings"
        arrow
      >
        <IconButton
          aria-label="Settings"
          onClick={handleOpen}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Stack
          gap={1}
          className={styles.Settingmenu}
        >
          <InlineSelectPrimitive
            title={`Frame Rate ${currentFrameRate}`}
            value={`${currentFrameRate}`}
            list={frameRateList}
            onSelect={handleChangeFrameRate}
            allowCustomValue
            customValue={isCustomFrameRate}
            onCustomValueChange={handleChangeFrameRate}
          />
          <InlineSelectPrimitive
            title={`Resolution ${currentResolution}p`}
            value={`${currentResolution}`}
            list={['144', '720', '1080']}
            onSelect={handleChangeResolution}
            allowCustomValue
            customValue={isCustomResolution}
            onCustomValueChange={handleChangeResolution}
          />

          <div className={styles.slider}>
            <Typography className={styles.sliderLabel}>
              Max bitrate: <span>{bitrateToShortValue(bitrate || 0)} Mb/s</span>
            </Typography>
            <Slider
              defaultValue={bitrateToShortValue(bitrate || 0)}
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

