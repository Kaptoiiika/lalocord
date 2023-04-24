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

  const handleChangeVolume = (value: number) => {
    clientStream.volume = value
  }

  const handlePause = () => {
    client.channel.sendData("pauseStream", clientStream.type)
  }
  const handlePlay = () => {
    client.channel.sendData("resumeStream", clientStream.type)
  }

  return (
    <VideoPlayer
      stream={clientStream.stream}
      initVolume={clientStream.volume}
      onVolumeChange={handleChangeVolume}
      onPause={handlePause}
      onPlay={handlePlay}
    >
      <Stack className={styles.streamTooltip}>
        <Typography>{client.user?.username || client.user?.id}</Typography>
      </Stack>
    </VideoPlayer>
  )
}
