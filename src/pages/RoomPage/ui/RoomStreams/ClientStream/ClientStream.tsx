import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Button, Stack, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState, useEffect } from "react"
import { RTCClient, RTCClientMediaStream } from "@/entities/RTCClient"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import Tooltip from "@mui/material/Tooltip"

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
        e.preventDefault()
        e.stopPropagation()
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

  const allowControl = clientStream.allowControl

  return (
    <VideoPlayer
      stream={clientStream.stream}
      initVolume={clientStream.volume}
      onVolumeChange={handleChangeVolume}
      onPause={handlePause}
      onPlay={handlePlay}
      onFullscreenExit={handleTakeOffControll}
      fullScreen={takeControll}
      autoplay={autoplay}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        className={styles.streamTooltip}
      >
        <Typography>{client.user?.username || client.user?.id}</Typography>
        {allowControl && (
          <Tooltip title="Take control">
            <Button aria-label="Take control" onClick={handleTakeControll}>
              <KeyboardIcon />
            </Button>
          </Tooltip>
        )}
      </Stack>
    </VideoPlayer>
  )
}
