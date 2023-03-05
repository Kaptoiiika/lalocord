import { Stack } from "@mui/material"
import { ShareScreenMenu } from "./ShareScreenMenu/ShareScreenMenu"
import { ShareWebCamMenu } from "./ShareWebCamMenu/ShareWebCamMenu"

type RoomActionsProps = {}

export const RoomActions = (props: RoomActionsProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <ShareWebCamMenu />
      <ShareScreenMenu />
      <KNOPKA />
    </Stack>
  )
}

const KNOPKA = (props: RoomActionsProps) => {
  const {} = props
  return (
    <button
      onClick={() => {
        const elem = document.querySelector("body")
        if (elem) elem.style.background = "#f00"
      }}
    >
      PIZDA👁
    </button>
  )
}
