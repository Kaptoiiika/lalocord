import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Button, Stack, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState, useEffect } from "react"
import { RTCClient, RTCClientMediaStream } from "@/entities/RTCClient"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import Tooltip from "@mui/material/Tooltip"
import {
  ClientKeyPressEvent,
  ClientKeys,
  ClientMouseEvent,
} from "@/shared/types/ClientEvents"

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
    if (!takeControll) return
    const subDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.repeat) return
      const payload: ClientKeyPressEvent = {
        key: e.key,
        code: e.code as ClientKeys,
        state: "down",
      }
      client.channel.sendData("clientPressKey", payload)
    }
    const subUp = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.repeat) return
      const payload: ClientKeyPressEvent = {
        key: e.key,
        code: e.code as ClientKeys,
        state: "up",
      }
      client.channel.sendData("clientPressKey", payload)
    }

    document.addEventListener("keydown", subDown)
    document.addEventListener("keyup", subUp)
    return () => {
      document.removeEventListener("keydown", subDown)
      document.removeEventListener("keyup", subUp)
    }
  }, [client.channel, takeControll])
  useEffect(() => {
    if (!takeControll) return

    const fn = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const payload: ClientMouseEvent = {
        clientX: e.clientX,
        clientY: e.clientY,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
        pageX: e.pageX,
        pageY: e.pageY,
        movementX: e.movementX,
        movementY: e.movementY,
      }
      client.channel.sendData("clientMouseChange", payload)
    }
    document.addEventListener("mousemove", fn)
    return () => {
      document.removeEventListener("mousemove", fn)
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
