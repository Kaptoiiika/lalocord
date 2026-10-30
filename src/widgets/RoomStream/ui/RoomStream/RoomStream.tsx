import type { ReactNode } from 'react'
import { memo, useCallback, useEffect, useId, useRef, useState } from 'react'

import { DrawOutlined, MouseOutlined, PictureInPictureOutlined } from '@mui/icons-material'
import RemoveIcon from '@mui/icons-material/Remove'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { CanvasPainter } from 'src/features/CanvasPainter'
import { RemoteControlLayer } from 'src/features/RemoteControl'
import { classNames } from 'src/shared/lib/classNames/classNames'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition'
import { VideoPlayer } from 'src/shared/ui/VideoPlayer/VideoPlayer'

import type { StreamType } from 'src/entities/WebRTC'
import type { RoomUser } from 'src/features/WebRTCRoom'

import { useRoomStreamStore } from '../../model/store/RoomStreamStore'

import styles from './RoomStream.module.scss'

type RoomStreamProps = {
  user?: RoomUser
  stream: MediaStream
  autoplay?: boolean
  title?: string
  volume?: number
  mute?: boolean
  onVolumeChange?: (volume: number) => void
  onPlay?: () => void
  onPause?: () => void
  type?: StreamType
  isLocal?: boolean
}

export const RoomStream = memo(function RoomStream(props: RoomStreamProps) {
  const {
    type,
    stream,
    user,
    title,
    volume = 0,
    mute,
    autoplay: propsAutoPlay,
    onVolumeChange,
    onPause,
    onPlay,
    isLocal = false,
  } = props
  const { hiddenStreams, hideStreams, unHideStreams } = useRoomStreamStore()
  const componentId = useId().split(':').join('')
  const [autoplay, setAutoplay] = useState(!document.hidden)
  const [played, setPlayed] = useState(false)
  const [drawLine, setDrawLine] = useState(false)
  const [isRemoteControlAvailable, setIsRemoteControlAvailable] = useState(false)
  const [isRemoteControlActive, setIsRemoteControlActive] = useState(false)
  const isRemoteControlActiveRef = useRef(false)
  const { handleOpen: handleOpenfullscreen, handleClose: handleClosefullscreen, open: fullScreen } = useIsOpen()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hide = hiddenStreams.includes(stream.id)

  useMountedEffect(() => {
    const handleAutoplay = () => {
      if (document.hidden) setAutoplay(false)
      else setAutoplay(true)
    }

    document.addEventListener('visibilitychange', handleAutoplay)
    return () => {
      document.removeEventListener('visibilitychange', handleAutoplay)
    }
  })

  const handlePause = () => {
    setPlayed(false)
    onPause?.()
  }

  const handlePlay = () => {
    setPlayed(true)
    onPlay?.()
  }

  const endRemoteControl = useCallback(() => {
    const wasActive = isRemoteControlActiveRef.current
    isRemoteControlActiveRef.current = false
    setIsRemoteControlActive(false)
    if (wasActive) user?.peer.sendControlEvent({ type: 'release' })
  }, [user])

  const stopRemoteControl = useCallback(() => {
    endRemoteControl()
    handleClosefullscreen()
  }, [endRemoteControl, handleClosefullscreen])

  const handleStartRemoteControl = () => {
    isRemoteControlActiveRef.current = true
    setIsRemoteControlActive(true)
    handleOpenfullscreen()
  }

  const handleFullscreenExit = () => {
    handleClosefullscreen()
    endRemoteControl()
  }

  const handleHide = async () => {
    if (played) handlePause()
    stopRemoteControl()
    await startViewTransition()
    hideStreams(stream.id)
  }

  const handleUnHide = async () => {
    if (!played) handlePlay()
    await startViewTransition()
    unHideStreams(stream.id)
  }

  const handlePictureInPictureEnter = () => {
    videoRef.current?.requestPictureInPicture?.()
  }

  const handleDrawLine = () => {
    setDrawLine((prev) => !prev)
  }

  useEffect(() => {
    if (!user) return

    const handleRemoteControlStatus = (isAvailable: boolean) => {
      setIsRemoteControlAvailable(isAvailable)
    }

    setIsRemoteControlAvailable(user.peer.remoteControlAvailable)
    user.peer.on('onRemoteControlStatus', handleRemoteControlStatus)

    return () => {
      user.peer.off('onRemoteControlStatus', handleRemoteControlStatus)
    }
  }, [user])

  useEffect(() => {
    if (isRemoteControlAvailable || !isRemoteControlActiveRef.current) return

    stopRemoteControl()
  }, [isRemoteControlAvailable, stopRemoteControl])

  const hideIndex = Math.max(hiddenStreams.indexOf(stream.id), 0)
  const canDrawLine = type === 'screen'
  const canControl = canDrawLine && !isLocal && isRemoteControlAvailable

  let streamOverlay: ReactNode

  if (isRemoteControlActive && user) {
    streamOverlay = (
      <RemoteControlLayer
        videoRef={videoRef}
        onControlEvent={(event) => {
          user.peer.sendControlEvent(event)
        }}
        onExit={stopRemoteControl}
      />
    )
  } else if (canDrawLine) {
    streamOverlay = (
      <CanvasPainter
        id={componentId}
        user={user}
        needCtrlKey={!drawLine}
        isLocal={isLocal}
      />
    )
  }

  return (
    <div
      id={componentId}
      style={{
        viewTransitionName: componentId,
        left: hideIndex * 100,
        position: hide ? 'absolute' : 'relative',
      }}
      className={classNames(styles.stream, {
        [styles.hideStream]: hide,
        [styles.drawLine]: drawLine,
      })}
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      <VideoPlayer
        ref={videoRef}
        played={played}
        stream={stream}
        initVolume={volume}
        onVolumeChange={onVolumeChange}
        onPause={handlePause}
        onPlay={handlePlay}
        fullScreen={fullScreen}
        className={isRemoteControlActive ? styles.remoteControlVideo : undefined}
        onFullscreenEnter={handleOpenfullscreen}
        onFullscreenExit={handleFullscreenExit}
        autoplay={autoplay ? propsAutoPlay : false}
        controls={!hide}
        mute={mute}
        overlay={streamOverlay}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          className={styles.streamTooltip}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            color="primary"
          >
            {title}
          </Typography>

          <Stack
            direction="row"
            gap={2}
          >
            {canDrawLine && !isLocal && (
              <Tooltip title="Draw a line">
                <IconButton
                  color="primary"
                  aria-label="Draw a line"
                  onClick={handleDrawLine}
                >
                  {drawLine ? <DrawOutlined /> : <DrawOutlined color="disabled" />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Picture in picture">
              <IconButton
                color="primary"
                aria-label="Picture in picture"
                onClick={handlePictureInPictureEnter}
              >
                <PictureInPictureOutlined />
              </IconButton>
            </Tooltip>

            {canControl && (
              <Tooltip title="Remote control">
                <IconButton
                  color="primary"
                  aria-label="Remote control"
                  onClick={handleStartRemoteControl}
                >
                  {isRemoteControlActive ? <MouseOutlined /> : <MouseOutlined color="disabled" />}
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Hide stream">
              <IconButton
                color="primary"
                aria-label="Hide stream"
                onClick={handleHide}
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </VideoPlayer>

      {hide && (
        <div className={styles.unhide}>
          <Tooltip title="Unhide stream">
            <IconButton
              color="primary"
              aria-label="Unhide stream"
              onClick={handleUnHide}
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  )
})
