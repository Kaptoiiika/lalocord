import { SpeedDial, SpeedDialAction } from "@mui/material"
import styles from "./RoomActions.module.scss"

import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import VideocamIcon from "@mui/icons-material/Videocam"
import AspectRatioIcon from "@mui/icons-material/AspectRatio"

type RoomActionsProps = {
  startWebCamStream?: (stream: MediaStream) => void
  startDisplayMediaStream?: (stream: MediaStream) => void
}

export const RoomActions = (props: RoomActionsProps) => {
  const { startWebCamStream,startDisplayMediaStream } = props

  const hundleWebCamStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    startWebCamStream?.(stream)
  }

  const hundleAppStream = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    })
    startDisplayMediaStream?.(stream)
  }

  return (
    <SpeedDial
      ariaLabel="user action"
      sx={{ position: "absolute", bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
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
  )
}
