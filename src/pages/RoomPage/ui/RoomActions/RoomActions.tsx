import { Backdrop, SpeedDial, SpeedDialAction } from "@mui/material"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import VideocamIcon from "@mui/icons-material/Videocam"
import AspectRatioIcon from "@mui/icons-material/AspectRatio"
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "./RoomActions.module.scss"
import { useState } from "react"

type RoomActionsProps = {
  startWebCamStream?: (stream: MediaStream) => void
  startDisplayMediaStream?: (stream: MediaStream) => void
  stopStream?: () => void
}

export const RoomActions = (props: RoomActionsProps) => {
  const { startWebCamStream, startDisplayMediaStream, stopStream } = props
  const [open, setOpen] = useState(false)
  const [error, setError] = useState({ usermedia: null })
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const hundleWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { frameRate: 60, width: 1920, height: 1024 },
      })
      startWebCamStream?.(stream)
      handleClose()
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
      handleClose()
    } catch (error: any) {}
  }

  const hundleStopStream = () => {
    stopStream?.()
    handleClose()
  }

  return (
    <div>
      <Backdrop open={open} />

      <SpeedDial
        ariaLabel="user action"
        direction="left"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon aria-label="user action" />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {!!startWebCamStream && (
          <SpeedDialAction
            icon={<VideocamIcon />}
            onClick={hundleWebCamStream}
            tooltipTitle={error.usermedia || "Turn on camera"}
            disableInteractive={!!error.usermedia}
          />
        )}
        {!!startDisplayMediaStream && (
          <SpeedDialAction
            icon={<AspectRatioIcon />}
            onClick={hundleAppStream}
            tooltipTitle={"Share your screen"}
          />
        )}
        {!!stopStream && (
          <SpeedDialAction
            icon={<VideocamOffIcon />}
            onClick={hundleStopStream}
            tooltipTitle={"Stop stream"}
          />
        )}
      </SpeedDial>
    </div>
  )
}
