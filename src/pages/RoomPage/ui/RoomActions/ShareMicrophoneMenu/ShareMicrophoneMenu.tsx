import { useCallback, useState } from 'react'

import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import { Tooltip, IconButton, FormControlLabel, Switch, Stack, Menu, Typography } from '@mui/material'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { FormateError } from 'src/shared/api'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'

import { SelectMicrophone } from './SelectMicrophone'

export const ShareMicrophoneMenu = () => {
  const { handleClick, handleClose, anchorEl, open } = usePopup()
  const autoOn = useWebRTCStore((state) => state.autoOnMic)
  const micStream = useWebRTCStore((state) => state.streams.mic)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)
  const setAutoOnMic = useWebRTCStore((state) => state.setAutoOnMic)
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const noiseSuppression = useWebRTCStore((state) => state.streamConstraints.audio.noiseSuppression)
  const echoCancellation = useWebRTCStore((state) => state.streamConstraints.audio.echoCancellation)
  const autoGainControl = useWebRTCStore((state) => state.streamConstraints.audio.autoGainControl)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [error, setError] = useState<React.ReactNode>('')

  const handleStopStream = useCallback(async () => {
    stopStream('mic')
  }, [stopStream])

  const handleStartStream = useCallback(async () => {
    await createStream('mic')
      .then(() => {
        setError('')
      })
      .catch((err) => {
        setError(
          <>
            Error starting microphone stream
            <br />
            {FormateError(err)}
          </>
        )
      })
  }, [createStream])

  const handleChangeAutoOn = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setAutoOnMic(checked)
    },
    [setAutoOnMic]
  )

  const handleChangeAudioSettings = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setStreamConstraints({
        ...streamConstraints,
        audio: {
          ...streamConstraints.audio,
          [event.target.name]: event.target.checked,
        },
      })
    },
    [setStreamConstraints, streamConstraints]
  )

  useMountedEffect(() => {
    if (autoOn) handleStartStream()
  })

  return (
    <>
      {micStream ? (
        <Tooltip
          title={error || 'Turn off microphone'}
          arrow
        >
          <IconButton
            color={error ? 'error' : 'default'}
            onClick={handleStopStream}
            onContextMenu={handleClick}
          >
            <MicIcon color="success" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title={error || 'Turn on microphone'}
          arrow
        >
          <IconButton
            color={error ? 'error' : 'default'}
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
        <Stack>
          <Stack
            gap={1}
            padding={1}
          >
            <Typography>Audio settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={autoOn}
                  onChange={handleChangeAutoOn}
                />
              }
              label="Auto on microphone"
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  name="noiseSuppression"
                  checked={Boolean(noiseSuppression)}
                  onChange={handleChangeAudioSettings}
                />
              }
              label="Noise suppression"
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  name="echoCancellation"
                  checked={Boolean(echoCancellation)}
                  onChange={handleChangeAudioSettings}
                />
              }
              label="Echo cancellation"
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  name="autoGainControl"
                  checked={Boolean(autoGainControl)}
                  onChange={handleChangeAudioSettings}
                />
              }
              label="Auto gain control"
            />
          </Stack>
          <SelectMicrophone />
        </Stack>
      </Menu>
    </>
  )
}
