import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Button, Stack, Tooltip, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState } from "react"
import { RTCClient, RTCClientMediaStream } from "@/entities/RTCClient"
import RemoveIcon from "@mui/icons-material/Remove"
import { classNames } from "@/shared/lib/classNames/classNames"

type ClientStreamProps = {
  client: RTCClient
  clientStream: RTCClientMediaStream
}

export const ClientStream = (props: ClientStreamProps) => {
  const { client, clientStream } = props
  const [autoplay, setAutoplay] = useState(!document.hidden)
  const [hide, setHide] = useState(false)

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

  const handleHide = () => {
    handlePause()
    setHide((prev) => !prev)
  }

  return (
    <div className={classNames([styles.stream], { [styles.hideStream]: hide })}>
      <VideoPlayer
        stream={clientStream.stream}
        initVolume={clientStream.volume}
        onVolumeChange={handleChangeVolume}
        onPause={handlePause}
        onPlay={handlePlay}
        autoplay={autoplay}
        controls={!hide}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          className={styles.streamTooltip}
        >
          <Typography>{client.user?.username || client.user?.id}</Typography>

          <Tooltip title="Hide stream">
            <Button aria-label="Hide stream" onClick={handleHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </Stack>
      </VideoPlayer>

      {hide && (
        <div className={styles.unhide}>
          <Tooltip title="Unhide stream">
            <Button aria-label="Unhide stream" onClick={handleHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
