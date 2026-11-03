import { useState } from 'react'

import { useWebRTCStore } from 'src/entities/WebRTC'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { SelectField } from 'src/shared/ui'

import type { ObjectStreamConstraints } from 'src/entities/WebRTC/utils/streamConstraints'

const getDeviceId = (deviceId: MediaTrackConstraints['deviceId']) => {
  if (typeof deviceId === 'string' && deviceId) return deviceId

  return undefined
}

export const SelectCamera = () => {
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState('')

  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const nextCameras = devices.filter((device) => device.kind === 'videoinput')
        if (nextCameras.length === 0) {
          return setError('No cameras found')
        }
        setCameras(nextCameras)
      })
      .catch(() => {
        setError('No access')
      })
  })

  const handleChange = (deviceId: string) => {
    const newstreamSettings: ObjectStreamConstraints = {
      ...streamConstraints,
      video: {
        ...streamConstraints.video,
        deviceId,
      },
    }

    setStreamConstraints(newstreamSettings)
  }

  const options = cameras
    .filter((camera) => camera.deviceId)
    .map((camera) => ({
      value: camera.deviceId,
      label: camera.label || camera.deviceId,
    }))

  return (
    <div className="flex w-[200px] flex-col gap-2">
      <SelectField
        label="Camera"
        error={Boolean(error)}
        disabled={Boolean(error)}
        value={getDeviceId(streamConstraints.video.deviceId)}
        onValueChange={handleChange}
        options={options}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
