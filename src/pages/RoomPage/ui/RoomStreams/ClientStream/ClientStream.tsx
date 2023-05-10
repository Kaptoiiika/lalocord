import { RTCClient } from "../../../../../entities/RTCClient/lib/RTCClient/RTCClient"
import { RTCClientMediaStream } from "../../../../../entities/RTCClient/lib/RTCClient/RTCClientMediaStream"
import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Stack, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState } from "react"

type ClientStreamProps = {
  client: RTCClient
  clientStream: RTCClientMediaStream
}

export const ClientStream = (props: ClientStreamProps) => {
  const { client, clientStream } = props
  const [autoplay, setAutoplay] = useState(!document.hidden)
  useMountedEffect(() => {
    const fn = () => {
      if (document.hidden) setAutoplay(false)
      else setAutoplay(true)
    }
    document.addEventListener("visibilitychange", fn)
    return () => {
      document.removeEventListener("visibilitychange", fn)
    }
  })

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
      autoplay={autoplay}
    >
      <Stack className={styles.streamTooltip}>
        <Typography>{client.user?.username || client.user?.id}</Typography>
      </Stack>
    </VideoPlayer>
  )
}
