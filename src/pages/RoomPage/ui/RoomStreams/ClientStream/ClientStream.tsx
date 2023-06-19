import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Button, Stack, Tooltip, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { useState } from "react"
import { RTCClient, RTCClientMediaStream } from "@/entities/RTCClient"
import RemoveIcon from "@mui/icons-material/Remove"
import { classNames } from "@/shared/lib/classNames/classNames"
import { useIsOpen } from "@/shared/lib/hooks/useIsOpen/useIsOpen"
import { startViewTransition } from "@/shared/lib/utils/ViewTransition/ViewTransition"

type ClientStreamProps = {
  client: RTCClient
  clientStream: RTCClientMediaStream
}

export const ClientStream = (props: ClientStreamProps) => {
  const { client, clientStream } = props
  const [autoplay, setAutoplay] = useState(!document.hidden)
  const [played, setPlayed] = useState(false)
  const [hide, setHide] = useState(false)
  const {
    handleOpen: handleOpenfullscreen,
    handleClose: handleClosefullscreen,
    open: fullScreen,
  } = useIsOpen()

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
    setPlayed(false)
    client.channel.sendData("pauseStream", clientStream.type)
  }
  const handlePlay = () => {
    setPlayed(true)
    client.channel.sendData("resumeStream", clientStream.type)
  }

  const handleHide = async () => {
    if (played) handlePause()
    handleClosefullscreen()
    await startViewTransition()
    setHide(true)
  }

  const handleUnHide = async () => {
    if (!played) handlePlay()
    await startViewTransition()
    setHide(false)
  }

  return (
    <div
      style={{
        viewTransitionName: `stream-${clientStream.id}`,
      }}
      className={classNames([styles.stream], { [styles.hideStream]: hide })}
    >
      <VideoPlayer
        stream={clientStream.stream}
        initVolume={clientStream.volume}
        onVolumeChange={handleChangeVolume}
        onPause={handlePause}
        onPlay={handlePlay}
        fullScreen={fullScreen}
        onFullscreenEnter={handleOpenfullscreen}
        onFullscreenExit={handleClosefullscreen}
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
            <Button aria-label="Unhide stream" onClick={handleUnHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
