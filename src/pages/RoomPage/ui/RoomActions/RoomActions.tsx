import { Stack } from "@mui/material"
import { useEffect } from "react"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { ShareScreenMenu } from "./ShareScreenMenu/ShareScreenMenu"
import { ShareWebCamMenu } from "./ShareWebCamMenu/ShareWebCamMenu"

type RoomActionsProps = {}

export const RoomActions = (props: RoomActionsProps) => {
  useEffect(() => {
    const fn = (event: KeyboardEvent) => {
      if (
        event.key === "F3" &&
        event.altKey &&
        event.shiftKey &&
        event.ctrlKey &&
        event.metaKey
      ) {
        const {
          displayMediaStream,
          webCamStream,
          setWebCamStream,
          setdisplayMediaStream,
        } = useRoomRTCStore.getState()
        displayMediaStream?.getTracks().forEach((track) => track.stop())
        webCamStream?.getTracks().forEach((track) => track.stop())
        setWebCamStream(null)
        setdisplayMediaStream(null)
      }
    }
    document.addEventListener("keydown", fn)
    return () => {
      document.removeEventListener("keydown", fn)
    }
  }, [])

  return (
    <Stack direction="row" alignItems="center">
      <ShareWebCamMenu />
      <ShareScreenMenu />
    </Stack>
  )
}
