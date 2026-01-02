import { memo, useId, useRef, useState } from 'react'

import { DrawOutlined, PictureInPictureOutlined } from '@mui/icons-material'
import RemoveIcon from '@mui/icons-material/Remove'
import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { classNames } from 'src/shared/lib/classNames/classNames'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition'
import { VideoPlayer } from 'src/shared/ui/VideoPlayer/VideoPlayer'

import type { StreamType } from 'src/entities/WebRTC'
import type { RoomUser } from 'src/features/WebRTCRoom'

import { CanvasPainter } from './CanvasPainter'

import styles from './RoomStream.module.scss'

type RoomStreamProps = {
  user?: RoomUser
  stream: MediaStream
  /**
   * default auto
   * if (document.hidden === true) autoplay = true
   * else autoplay = false
   * @type {string}
   */
  autoplay?: boolean
  hide?: boolean
  hideId?: number
  title?: string
  volume?: number
  mute?: boolean
  onHide?: () => void
  onUnHide?: () => void
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
    hide: propsHide,
    hideId,
    onVolumeChange,
    onHide,
    onPause,
    onPlay,
    onUnHide,
    isLocal = false,
  } = props
  const componentId = useId().split(':').join('')
  const [autoplay, setAutoplay] = useState(!document.hidden)
  const [played, setPlayed] = useState(false)
  const [hide, setHide] = useState(false)
  const [drawLine, setDrawLine] = useState(false)
  const { handleOpen: handleOpenfullscreen, handleClose: handleClosefullscreen, open: fullScreen } = useIsOpen()
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const handleHide = async () => {
    if (played) handlePause()
    handleClosefullscreen()
    await startViewTransition()
    setHide(true)
    onHide?.()
  }

  const handleUnHide = async () => {
    if (!played) handlePlay()
    await startViewTransition()
    setHide(false)
    onUnHide?.()
  }

  const handlePictureInPictureEnter = () => {
    videoRef.current?.requestPictureInPicture?.()
  }

  const handleDrawLine = () => {
    setDrawLine((prev) => !prev)
  }

  const onUnHideRef = useRef(onUnHide)

  onUnHideRef.current = onUnHide
  useMountedEffect(() => {
    const getOnUnHideRef = () => onUnHideRef.current

    return () => {
      getOnUnHideRef()?.()
    }
  })

  const isHidden = propsHide ?? hide

  return (
    <div
      id={componentId}
      style={{
        viewTransitionName: componentId,
        left: hide ? (hideId ?? 0) * 100 : 0,
        position: hide ? 'absolute' : 'relative',
      }}
      className={classNames(styles.stream, {
        [styles.hideStream]: isHidden,
        [styles.drawLine]: drawLine,
      })}
      draggable="false"
      onDragStart={(e) => e.preventDefault()}
    >
      {type === 'screen' && (
        <CanvasPainter
          id={componentId}
          user={user}
          needCtrlKey={!drawLine}
          isLocal={isLocal}
        />
      )}
      <VideoPlayer
        ref={videoRef}
        played={played}
        stream={stream}
        initVolume={volume}
        onVolumeChange={onVolumeChange}
        onPause={handlePause}
        onPlay={handlePlay}
        fullScreen={fullScreen}
        onFullscreenEnter={handleOpenfullscreen}
        onFullscreenExit={handleClosefullscreen}
        autoplay={autoplay ? propsAutoPlay : false}
        controls={!isHidden}
        mute={mute}
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
            {type === 'screen' && (
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

      {isHidden && (
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
