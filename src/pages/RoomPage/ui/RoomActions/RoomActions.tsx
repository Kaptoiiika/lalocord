import { Stack } from "@mui/material"
import { ShareMicrophoneMenu } from "./ShareMicrophoneMenu/ShareMicrophoneMenu"
import { ShareScreenMenu } from "./ShareScreenMenu/ShareScreenMenu"
import { ShareWebCamMenu } from "./ShareWebCamMenu/ShareWebCamMenu"

type RoomActionsProps = {}

export const RoomActions = (props: RoomActionsProps) => {
  return (
    <Stack direction="row" alignItems="end">
      <ShareMicrophoneMenu />
      <ShareWebCamMenu />
      <ShareScreenMenu />
    </Stack>
  )
}
