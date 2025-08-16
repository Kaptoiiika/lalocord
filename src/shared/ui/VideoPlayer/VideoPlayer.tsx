import { classNames } from "@/shared/lib/classNames/classNames"
import {
  memo,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import styles from "./VideoPlayer.module.scss"
import { VideoPlayerDebugInfo } from "./VideoPlayerDebugInfo/VideoPlayerDebugInfo"
import { useIsOpen } from "@/shared/lib/hooks/useIsOpen/useIsOpen"
import { VideoPlayerActions } from "./VideoPlayerActions/VideoPlayerActions"
import { VideoPlayerTooltip } from "./VideoPlayerTooltip/VideoPlayerTooltip"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { clamp } from "@/shared/lib/utils/Numbers"
import { ErrorBoundary } from "../ErrorBoundary"
import { useDebugMode } from "@/shared/lib/hooks/useDebugMode/useDebugMode"

type VideoPlayerProps = {
  stream?: MediaStream | null
  played: boolean
  onPlay?: () => void
  onPause?: () => void
  onFullscreenEnter?: () => void
  onFullscreenExit?: () => void
  onVolumeChange?: (value: number) => void
  initVolume?: number
  className?: string
  mute?: boolean
  autoplay?: boolean
  fullScreen?: boolean
  controls?: boolean
} & PropsWithChildren

export const VideoPlayer = memo(function VideoPlayer(props: VideoPlayerProps) {
  const {
    stream = null,
    initVolume = 0,
    played,
    className,
    mute,
    autoplay,
    fullScreen: propsFullScreen = false,
    onPlay,
    onPause,
    onVolumeChange,
    onFullscreenEnter,
    onFullscreenExit,
    children,
    controls = true,
    ...other
  } = props
  const debugMode = useDebugMode()
  const [fullscreen, setFullscreen] = useState(false)
  const [volume, setVolume] = useState(clamp(initVolume, 0, 1))
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)
  const { handleClose, handleOpen, open } = useIsOpen({ time: 3000 })

  useEffect(() => {
    if (played) videoRef.current?.play()
    else videoRef.current?.pause()
  }, [played])

  const handlePause = useCallback(() => {
    onPause?.()
  }, [onPause])

  const handlePlay = useCallback(() => {
    try {
      onPlay?.()
    } catch (error) {
      console.error(error)
    }
  }, [onPlay])

  useMountedEffect(() => {
    if (autoplay) {
      handlePlay()
    }
  })

  const handlePlayPause = useCallback(() => {
    if (played) handlePause()
    else handlePlay()
  }, [played, handlePlay, handlePause])

  const handleChangeVolume = useCallback(
    (event: Event, newValue: number | number[]) => {
      if (videoRef.current && !Array.isArray(newValue)) {
        setVolume(newValue)
        onVolumeChange?.(newValue)
      }
    },
    [onVolumeChange]
  )

  const handleEnterFullscreen = useCallback(() => {
    try {
      playerRef.current?.requestFullscreen().catch(console.error)
      setFullscreen(true)
      onFullscreenEnter?.()
      if (!played) handlePlay()
    } catch (error) {
      console.error(error)
    }
  }, [onFullscreenEnter, played, handlePlay])

  const handleExitFullscreen = useCallback(() => {
    try {
      document.exitFullscreen().catch(console.error)
      setFullscreen(false)
      onFullscreenExit?.()
    } catch (error) {
      console.error(error)
    }
  }, [onFullscreenExit])

  const handleFullscreenToggle = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (document.fullscreenElement) handleExitFullscreen()
      else handleEnterFullscreen()
    },
    [handleExitFullscreen, handleEnterFullscreen]
  )

  useEffect(() => {
    if (propsFullScreen === true && fullscreen === false) {
      handleEnterFullscreen()
    } else if (propsFullScreen === false && fullscreen === true) {
      handleExitFullscreen()
    }
    if (!playerRef.current) return
    playerRef.current.onfullscreenchange = () => {
      if (!document.fullscreenElement) handleExitFullscreen()
    }
  }, [propsFullScreen, fullscreen, handleEnterFullscreen, handleExitFullscreen])

  const handleRefVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node
      if (!node) return
      if (node.srcObject !== stream) {
        node.srcObject = stream
      }
    },
    [stream]
  )

  const handleRefPlayer = useCallback((node: HTMLDivElement | null) => {
    playerRef.current = node
    if (!node) return
  }, [])

  if (videoRef.current) {
    videoRef.current.volume = volume
  }

  const toolsIsClosed = played && !open

  const handleFocus = useCallback(() => {
    handleOpen()
  }, [handleOpen])

  return (
    <ErrorBoundary errorText="Video player is dead">
      <div
        className={styles.player}
        ref={handleRefPlayer}
        onFocus={handleFocus}
        onMouseEnter={handleOpen}
        onMouseMove={handleOpen}
        onClick={handleOpen}
        onBlur={handleClose}
        onMouseLeave={handleClose}
      >
        {debugMode && <VideoPlayerDebugInfo stream={stream} />}
        {controls && (
          <>
            <VideoPlayerTooltip open={!toolsIsClosed} top>
              {children}
            </VideoPlayerTooltip>
            <VideoPlayerActions
              stream={stream}
              open={!toolsIsClosed}
              fullscreen={fullscreen}
              played={played}
              volume={volume}
              mute={mute}
              handleChangeVolume={handleChangeVolume}
              handleExitFullscreen={handleExitFullscreen}
              handleFullscreen={handleEnterFullscreen}
              handlePlayPause={handlePlayPause}
            />
          </>
        )}
        <video
          {...other}
          onDoubleClick={handleFullscreenToggle}
          ref={handleRefVideo}
          className={classNames(styles.video, className, {
            [styles.cursorHide]: toolsIsClosed,
          })}
          playsInline
        />
      </div>
    </ErrorBoundary>
  )
})
