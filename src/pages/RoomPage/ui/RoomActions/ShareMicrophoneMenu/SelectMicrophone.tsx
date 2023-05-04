import { useRoomRTCStore } from "@/entities/RTCClient"
import { UserStreamSettings } from "@/entities/RTCClient/model/types/RoomRTCSchema"
import { getUserStreamSettings } from "@/pages/RoomPage/model/selectors/RoomRTCSelectors"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import {
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Typography,
  Select,
  MenuItem,
} from "@mui/material"
import { useState } from "react"

type SelectMicrophoneProps = {}

export const SelectMicrophone = (props: SelectMicrophoneProps) => {
  const {} = props
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings)
  const setStreamingSettings = useRoomRTCStore(
    (state) => state.setStreamSettings
  )
  const [microphones, setmicrophones] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState("")
  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const microphones = devices.filter(
          (device) => device.kind === "audioinput"
        )
        setmicrophones(microphones)
      })
      .catch(() => {
        setError("No access")
      })
  })

  const handleChange = (event: SelectChangeEvent) => {
    const newstreamSettings: UserStreamSettings = {
      ...userStreamSettings,
      audio: {
        ...userStreamSettings.audio,
        deviceId: event.target.value,
      },
    }
    setStreamingSettings(newstreamSettings)
  }

  const selectedMicrophone = microphones.find((microphone) => {
    if (typeof userStreamSettings.video === "object")
      return microphone.deviceId === userStreamSettings.audio.deviceId
  })

  if (error) {
    return (
      <FormControl sx={{ m: 1, width: 200 }}>
        <InputLabel>{error}</InputLabel>
      </FormControl>
    )
  }

  return (
    <FormControl sx={{ m: 1, width: 200 }}>
      <Typography>Microphone</Typography>
      <Select
        fullWidth
        value={selectedMicrophone?.deviceId || ""}
        onChange={handleChange}
      >
        {microphones.map((microphone) => (
          <MenuItem key={microphone.deviceId} value={microphone.deviceId}>
            {microphone.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
