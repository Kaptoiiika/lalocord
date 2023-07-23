import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState } from "react"
import { useRoomRTCStore } from "@/entities/RTCClient"
import { Select, MenuItem } from "@mui/material"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import Typography from "@mui/material/Typography"
import styles from "./SelectCamera.module.scss"
import { SelectChangeEvent } from "@mui/material/Select/SelectInput"
import { UserStreamSettings } from "@/entities/RTCClient/model/types/RoomRTCSchema"
import { getUserStreamSettings } from "../../../../../../entities/RTCClient/model/selectors/RoomRTCSelectors"

type SelectCameraProps = {}

export const SelectCamera = (props: SelectCameraProps) => {
  const {} = props
  const userStreamSettings = useRoomRTCStore(getUserStreamSettings)
  const setStreamingSettings = useRoomRTCStore(
    (state) => state.setStreamSettings
  )
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [error, setError] = useState("")
  useMountedEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => {
        const cameras = devices.filter((device) => device.kind === "videoinput")
        setCameras(cameras)
      })
      .catch(() => {
        setError("No access")
      })
  })

  const handleChange = (event: SelectChangeEvent) => {
    const newstreamSettings: UserStreamSettings = {
      ...userStreamSettings,
      video: {
        ...userStreamSettings.video,
        deviceId: event.target.value,
      },
    }
    setStreamingSettings(newstreamSettings)
  }

  const selectedCamera = cameras.find((camera) => {
    if (typeof userStreamSettings.video === "object")
      return camera.deviceId === userStreamSettings.video.deviceId
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
      <Typography>Camera</Typography>
      <Select
        fullWidth
        value={selectedCamera?.deviceId || ""}
        onChange={handleChange}
      >
        {cameras.map((camera) => (
          <MenuItem key={camera.deviceId} value={camera.deviceId}>
            {camera.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
