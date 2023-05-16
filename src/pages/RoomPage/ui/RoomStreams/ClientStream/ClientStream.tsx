import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Stack, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState, useEffect } from "react"
import { RTCClient, RTCClientMediaStream } from "@/entities/RTCClient"

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
  const [takeControll, setTakeControll] = useState(false)

  useEffect(() => {
    if (takeControll) {
      const sub = (e: KeyboardEvent) => {
        client.channel.sendData("clientPressKey", e.key)
      }
      document.addEventListener("keypress", sub)
      return () => {
        document.removeEventListener("keypress", sub)
      }
    }
  }, [client.channel, takeControll])
  const handleTakeControll = () => {
    setTakeControll(true)
  }
  const handleTakeOffControll = () => {
    setTakeControll(false)
  }
  return (
    <VideoPlayer
      stream={clientStream.stream}
      initVolume={clientStream.volume}
      onVolumeChange={handleChangeVolume}
      onPause={handlePause}
      onPlay={handlePlay}
      onFullscreenEnter={handleTakeControll}
      onFullscreenExit={handleTakeOffControll}
      autoplay={autoplay}
    >
      <Stack className={styles.streamTooltip}>
        <Typography>{client.user?.username || client.user?.id}</Typography>
      </Stack>
    </VideoPlayer>
  )
}
