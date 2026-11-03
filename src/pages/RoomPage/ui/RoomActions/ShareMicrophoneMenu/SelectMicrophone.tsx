import { useState } from 'react'

import { useWebRTCStore } from 'src/entities/WebRTC'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { SelectField } from 'src/shared/ui'

import type { ObjectStreamConstraints } from 'src/entities/WebRTC/utils/streamConstraints'

const getDeviceId = (deviceId: MediaTrackConstraints['deviceId']) => {
  if (typeof deviceId === 'string' && deviceId) return deviceId

  return undefined
}

export const SelectMicrophone = () => {
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [microphones, setmicrophones] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState('')

  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const nextMicrophones = devices.filter((device) => device.kind === 'audioinput')

        if (nextMicrophones.length === 0) {
          return setError('No microphones found')
        }

        setmicrophones(nextMicrophones)
      })
      .catch(() => {
        setError('No access')
      })
  })

  const handleChangeMicorphone = (deviceId: string) => {
    const newstreamSettings: ObjectStreamConstraints = {
      ...streamConstraints,
      audio: {
        ...streamConstraints.audio,
        deviceId,
      },
    }

    setStreamConstraints(newstreamSettings)
  }

  const options = microphones
    .filter((microphone) => microphone.deviceId)
    .map((microphone) => ({
      value: microphone.deviceId,
      label: microphone.label || microphone.deviceId,
    }))

  return (
    <div className="flex w-[200px] flex-col gap-2">
      <SelectField
        label="Microphone"
        error={Boolean(error)}
        disabled={Boolean(error)}
        value={getDeviceId(streamConstraints.audio.deviceId)}
        onValueChange={handleChangeMicorphone}
        options={options}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
