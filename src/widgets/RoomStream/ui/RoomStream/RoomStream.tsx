import type { ReactNode } from 'react'
import { memo, useCallback, useEffect, useId, useRef, useState } from 'react'

import { Minus, Mouse, Pencil, PictureInPicture } from 'lucide-react'
import { CanvasPainter } from 'src/features/CanvasPainter'
import { RemoteControlLayer } from 'src/features/RemoteControl'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { cn } from 'src/shared/lib/utils/cn'
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition'
import { IconButton } from 'src/shared/ui'
import { VideoPlayer } from 'src/shared/ui/VideoPlayer/VideoPlayer'

import type { StreamType } from 'src/entities/WebRTC'
import type { RoomUser } from 'src/features/WebRTCRoom'

import { useRoomStreamStore } from '../../model/store/RoomStreamStore'

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

  const stopRemoteControl = useCallback(() => {
    const wasActive = isRemoteControlActiveRef.current
    isRemoteControlActiveRef.current = false
    setIsRemoteControlActive(false)
    if (wasActive) user?.peer.sendControlEvent({ type: 'release' })
    handleClosefullscreen()
  }, [handleClosefullscreen, user])

  const handleStartRemoteControl = () => {
    isRemoteControlActiveRef.current = true
    setIsRemoteControlActive(true)
    handleOpenfullscreen()
  }

  const handleFullscreenExit = () => {
    handleClosefullscreen()
    if (!isRemoteControlActiveRef.current) return

    isRemoteControlActiveRef.current = false
    setIsRemoteControlActive(false)
    user?.peer.sendControlEvent({ type: 'release' })
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
      className={cn(
        'w-full overflow-hidden bg-[var(--bg-app)]',
        hide && 'pointer-events-none absolute bottom-0 left-0 h-[50px] w-[100px] overflow-hidden',
        drawLine && 'cursor-crosshair'
      )}
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
        className={isRemoteControlActive ? 'bg-black object-contain' : undefined}
        onFullscreenEnter={handleOpenfullscreen}
        onFullscreenExit={handleFullscreenExit}
        autoplay={autoplay ? propsAutoPlay : false}
        controls={!hide}
        mute={mute}
        overlay={streamOverlay}
      >
        <div className="flex flex-row items-center justify-between">
          <p className="text-lg font-semibold text-white [filter:drop-shadow(0_0_1px_#000)_drop-shadow(0_1px_2px_rgba(0,0,0,0.9))]">
            {title}
          </p>

          <div className="flex flex-row gap-2">
            {canDrawLine && !isLocal && (
              <IconButton
                isOverlay
                tooltip="Draw a line"
                aria-label="Draw a line"
                onClick={handleDrawLine}
              >
                <Pencil className={drawLine ? undefined : 'text-white/65'} />
              </IconButton>
            )}

            <IconButton
              isOverlay
              tooltip="Picture in picture"
              aria-label="Picture in picture"
              onClick={handlePictureInPictureEnter}
            >
              <PictureInPicture />
            </IconButton>

            {canControl && (
              <IconButton
                isOverlay
                tooltip="Remote control"
                aria-label="Remote control"
                onClick={handleStartRemoteControl}
              >
                <Mouse className={isRemoteControlActive ? undefined : 'text-white/65'} />
              </IconButton>
            )}

            <IconButton
              isOverlay
              tooltip="Hide stream"
              aria-label="Hide stream"
              onClick={handleHide}
            >
              <Minus />
            </IconButton>
          </div>
        </div>
      </VideoPlayer>

      {hide && (
        <div className="pointer-events-auto absolute top-0 right-0">
          <IconButton
            isOverlay
            tooltip="Unhide stream"
            aria-label="Unhide stream"
            onClick={handleUnHide}
          >
            <Minus />
          </IconButton>
        </div>
      )}
    </div>
  )
})
