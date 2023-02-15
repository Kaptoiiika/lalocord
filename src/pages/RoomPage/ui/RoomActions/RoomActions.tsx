import { Backdrop, SpeedDial, SpeedDialAction } from "@mui/material"
import styles from "./RoomActions.module.scss"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import VideocamIcon from "@mui/icons-material/Videocam"
import AspectRatioIcon from "@mui/icons-material/AspectRatio"
import { useState } from "react"

type RoomActionsProps = {
  startWebCamStream?: (stream: MediaStream) => void
  startDisplayMediaStream?: (stream: MediaStream) => void
}

export const RoomActions = (props: RoomActionsProps) => {
  const { startWebCamStream, startDisplayMediaStream } = props
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const hundleWebCamStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    startWebCamStream?.(stream)
    handleClose()
  }

  const hundleAppStream = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: { frameRate: 60, width: 1920, height: 1024 },
    })
    startDisplayMediaStream?.(stream)
    handleClose()
  }

  return (
    <div>
      <Backdrop open={open} />

      <SpeedDial
        ariaLabel="user action"
        direction="left"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        <SpeedDialAction
          icon={<VideocamIcon />}
          onClick={hundleWebCamStream}
          tooltipTitle={"Turn on camera"}
        />
        <SpeedDialAction
          icon={<AspectRatioIcon />}
          onClick={hundleAppStream}
          tooltipTitle={"Turn on decktop stream"}
        />
      </SpeedDial>
    </div>
  )
}
