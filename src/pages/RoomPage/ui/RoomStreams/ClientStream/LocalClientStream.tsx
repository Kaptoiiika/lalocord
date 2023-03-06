import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Stack, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"

type ClientStreamProps = {
  stream: MediaStream | null
  name: string
}

export const LocalClientStream = (props: ClientStreamProps) => {
  const { name, stream } = props

  return (
    <VideoPlayer stream={stream} mute>
      <Stack className={styles.streamTooltip}>
        <Typography>{name}</Typography>
      </Stack>
    </VideoPlayer>
  )
}
