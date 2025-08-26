import { useCallback } from 'react'

import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import { Tooltip, IconButton, FormControlLabel, Switch, Stack, Menu } from '@mui/material'
import { useRoomRTCStore } from 'src/entities/RTCClient'
import { getUserStreamSettings } from 'src/entities/RTCClient/model/selectors/RoomRTCSelectors'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'

import { SelectMicrophone } from './SelectMicrophone'

export const ShareMicrophoneMenu = () => {
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings)
  const setStreamingSettings = useRoomRTCStore((state) => state.setStreamSettings)
  const { handleClick, handleClose, anchorEl, open } = usePopup()
  const autoOn = userStreamSettings.audio.autoOn

  const micStream = useWebRTCStore((state) => state.streams.mic)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)

  const handleStopStream = useCallback(async () => {
    stopStream('mic')
  }, [stopStream])

  const handleStartStream = useCallback(async () => {
    await createStream('mic')
  }, [createStream])

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
    if (autoOn) handleStartStream()
  })

  return (
    <>
      {micStream ? (
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
            onClick={handleStartStream}
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
