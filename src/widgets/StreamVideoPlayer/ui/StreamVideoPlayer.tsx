import { UserModel } from "@/entities/User"
import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Stack, Typography } from "@mui/material"
import styles from "./StreamVideoPlayer.module.scss"

type StreamVideoPlayerProps = {
  stream: MediaStream | null
  user?: UserModel
}

export const StreamVideoPlayer = (props: StreamVideoPlayerProps) => {
  const { stream, user } = props

  return (
    <VideoPlayer stream={stream}>
      <Stack className={styles.streamTooltip}>
        <Typography>{user?.username || user?.id}</Typography>
      </Stack>
    </VideoPlayer>
  )
}
