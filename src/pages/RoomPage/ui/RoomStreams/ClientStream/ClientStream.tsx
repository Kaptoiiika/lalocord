import { RTCClient } from "../../../lib/RTCClient/RTCClient"
import { RTCClientMediaStream } from "../../../lib/RTCClient/RTCClientMediaStream"
import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Stack, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"

type ClientStreamProps = {
  client: RTCClient
  clientStream: RTCClientMediaStream
}

export const ClientStream = (props: ClientStreamProps) => {
  const { client, clientStream } = props

  const hundleChangeVolume = (value: number) => {
    clientStream.volume = value
  }

  return (
    <VideoPlayer
      stream={clientStream.stream}
      initVolume={clientStream.volume}
      onVolumeChange={hundleChangeVolume}
    >
      <Stack className={styles.streamTooltip}>
        <Typography>{client.user?.username || client.user?.id}</Typography>
      </Stack>
    </VideoPlayer>
  )
}
