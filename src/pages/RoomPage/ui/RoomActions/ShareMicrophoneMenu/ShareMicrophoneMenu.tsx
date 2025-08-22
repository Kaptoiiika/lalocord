import { useCallback } from 'react'

import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import { Tooltip, IconButton, FormControlLabel, Switch, Stack, Menu } from '@mui/material'
import { useRoomRTCStore } from 'src/entities/RTCClient'
import {
  getMicrophoneStream,
  getActionStartMicrophoneStream,
  getActionStopMicrophoneStream,
  getUserStreamSettings,
} from 'src/entities/RTCClient/model/selectors/RoomRTCSelectors'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'

import { SelectMicrophone } from './SelectMicrophone'
// import styles from "./ShareMicrophoneMenu.module.scss"

export const ShareMicrophoneMenu = () => {
  const startStream = useRoomRTCStore(getActionStartMicrophoneStream)
  const stopStream = useRoomRTCStore(getActionStopMicrophoneStream)
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings)
  const setStreamingSettings = useRoomRTCStore((state) => state.setStreamSettings)
  const microphoneStream = useRoomRTCStore(getMicrophoneStream)
  const { handleClick, handleClose, anchorEl, open } = usePopup()
  const autoOn = userStreamSettings.audio.autoOn

  const handleStartMicStream = async () => {
    try {
      startStream()
    } catch (error: unknown) {
      console.log(error)
    }
  }

  const handleStopStream = useCallback(() => {
    stopStream()
  }, [stopStream])

  const handleChangeAutoOn = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setStreamingSettings({
        ...userStreamSettings,
        audio: {
          ...userStreamSettings.audio,
          autoOn: checked,
        },
      })
    },
    [setStreamingSettings, userStreamSettings]
  )

  useMountedEffect(() => {
    if (autoOn) handleStartMicStream()
  })

  return (
    <>
      {microphoneStream ? (
        <Tooltip
          title="Turn off microphone"
          arrow
        >
          <IconButton
            onClick={handleStopStream}
            onContextMenu={handleClick}
          >
            <MicIcon color="success" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title="Turn on microphone"
          arrow
        >
          <IconButton
            onClick={handleStartMicStream}
            onContextMenu={handleClick}
          >
            <MicOffIcon />
          </IconButton>
        </Tooltip>
      )}
      <Menu
        className="flex"
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
        <Stack gap={1}>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={userStreamSettings.audio.autoOn}
                onChange={handleChangeAutoOn}
              />
            }
            label="Auto on"
          />
          <SelectMicrophone />
        </Stack>
      </Menu>
    </>
  )
}

