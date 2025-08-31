import { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import { Select, MenuItem, FormControl, Typography } from '@mui/material'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'

import type { ObjectStreamConstraints } from 'src/entities/WebRTC/utils/streamConstraints'

export const SelectCamera = () => {
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState('')

  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const cameras = devices.filter((device) => device.kind === 'videoinput')
        if (cameras.length === 0) {
          return setError('No cameras found')
        }
        setCameras(cameras)
      })
      .catch(() => {
        setError('No access')
      })
  })

  const handleChange = (event: SelectChangeEvent) => {
    const newstreamSettings: ObjectStreamConstraints = {
      ...streamConstraints,
      video: {
        ...streamConstraints.video,
        deviceId: event.target.value,
      },
    }

    setStreamConstraints(newstreamSettings)
  }

  const selectedCamera = cameras.find((camera) => camera.deviceId === streamConstraints.video.deviceId)

  return (
    <FormControl
      sx={{
        p: 1,
        width: 200,
      }}
    >
      <Typography>Camera</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Select
        disabled={!!error}
        fullWidth
        value={selectedCamera?.deviceId || ''}
        onChange={handleChange}
      >
        {cameras.map((camera) => (
          <MenuItem
            key={camera.deviceId}
            value={camera.deviceId}
          >
            {camera.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
