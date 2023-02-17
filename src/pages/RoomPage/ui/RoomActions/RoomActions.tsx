import { Backdrop, SpeedDial, IconButton, Paper } from "@mui/material"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import VideocamIcon from "@mui/icons-material/Videocam"
import AspectRatioIcon from "@mui/icons-material/AspectRatio"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import styles from "./RoomActions.module.scss"
import { useState } from "react"

type RoomActionsProps = {
  startWebCamStream?: (stream: MediaStream) => void
  startDisplayMediaStream?: (stream: MediaStream) => void
  stopStream?: () => void
}

export const RoomActions = (props: RoomActionsProps) => {
  const { startWebCamStream, startDisplayMediaStream, stopStream } = props
  const [error, setError] = useState({ usermedia: null })

  const hundleWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { frameRate: 60, width: 1920, height: 1024 },
      })
      startWebCamStream?.(stream)
    } catch (error: any) {
      setError((prev) => ({ ...prev, usermedia: error?.message }))
    }
  }

  const hundleAppStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: { frameRate: 60, width: 1920, height: 1024 },
      })
      startDisplayMediaStream?.(stream)
    } catch (error: any) {}
  }

  const hundleStopStream = () => {
    stopStream?.()
  }

  return (
    <Paper className={styles.RoomActions} variant="outlined" square>
      {!!startWebCamStream && (
        <IconButton
          onClick={hundleWebCamStream}
          aria-label={error.usermedia || "Turn on camera"}
          disabled={!!error.usermedia}
        >
          <VideocamIcon />
        </IconButton>
      )}
      {!!startDisplayMediaStream && (
        <IconButton onClick={hundleAppStream} aria-label={"Share your screen"}>
          <AspectRatioIcon />
        </IconButton>
      )}
      {!!stopStream && (
        <IconButton onClick={hundleStopStream} aria-label={"Stop stream"}>
          <VideocamOffIcon />
        </IconButton>
      )}
    </Paper>
  )
}
