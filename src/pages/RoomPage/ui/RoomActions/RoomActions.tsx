import { Stack } from "@mui/material"
import { VideoSettingsMenu } from "./SettingsMenu/VideoSettingsMenu"
import { ShareMicrophoneMenu } from "./ShareMicrophoneMenu/ShareMicrophoneMenu"
import { ShareScreenMenu } from "./ShareScreenMenu/ShareScreenMenu"
import { ShareWebCamMenu } from "./ShareWebCamMenu/ShareWebCamMenu"
import { StartMiniGame } from "./StartMiniGame/StartMiniGame"
import styles from "./RoomActions.module.scss"
type RoomActionsProps = {}

export const RoomActions = (props: RoomActionsProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <ShareMicrophoneMenu />
      <ShareWebCamMenu />
      <ShareScreenMenu />
      <StartMiniGame />
      <Stack className={styles.group} direction="row" alignItems="center">
        <VideoSettingsMenu />
      </Stack>
    </Stack>
  )
}
