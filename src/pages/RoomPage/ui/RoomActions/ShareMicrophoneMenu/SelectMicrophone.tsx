import { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import { FormControl, InputLabel, Typography, Select, MenuItem } from '@mui/material'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'

import type { ObjectStreamConstraints } from 'src/entities/WebRTC/utils/streamConstraints'

export const SelectMicrophone = () => {
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [microphones, setmicrophones] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState('')

  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const microphones = devices.filter((device) => device.kind === 'audioinput')

        setmicrophones(microphones)
      })
      .catch(() => {
        setError('No access')
      })
  })

  const handleChangeMicorphone = (event: SelectChangeEvent) => {
    const newstreamSettings: ObjectStreamConstraints = {
      ...streamConstraints,
      audio: {
        ...streamConstraints.audio,
        deviceId: event.target.value,
      },
    }

    setStreamConstraints(newstreamSettings)
  }

  const selectedMicrophone = microphones.find((microphone) => microphone.deviceId === streamConstraints.audio.deviceId)

  if (error) {
    return (
      <FormControl
        sx={{
          m: 1,
          width: 200,
        }}
      >
        <InputLabel>{error}</InputLabel>
      </FormControl>
    )
  }

  return (
    <FormControl
      sx={{
        m: 1,
        width: 200,
      }}
    >
      <Typography>Microphone</Typography>
      <Select
        fullWidth
        value={selectedMicrophone?.deviceId || ''}
        onChange={handleChangeMicorphone}
      >
        {microphones.map((microphone) => (
          <MenuItem
            key={microphone.deviceId}
            value={microphone.deviceId}
          >
            {microphone.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
