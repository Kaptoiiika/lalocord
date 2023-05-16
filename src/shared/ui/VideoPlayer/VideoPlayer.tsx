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
import { getNumberBeetwenTwoValues } from "@/shared/lib/utils/Numbers/getNumberBeetwenTwoValues"
import { VideoPlayerDebugInfo } from "./VideoPlayerDebugInfo/VideoPlayerDebugInfo"
import { useIsOpen } from "@/shared/lib/hooks/useIsOpen/useIsOpen"
import { VideoPlayerActions } from "./VideoPlayerActions/VideoPlayerActions"
import { VideoPlayerTooltip } from "./VideoPlayerTooltip/VideoPlayerTooltip"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"

type VideoPlayerProps = {
  stream?: MediaStream | null
  onPlay?: () => void
  onPause?: () => void
  onFullscreenEnter?: () => void
  onFullscreenExit?: () => void
  onVolumeChange?: (value: number) => void
  initVolume?: number
  className?: string
  mute?: boolean
  autoplay?: boolean
} & PropsWithChildren

let debugValue = !!localStorage.getItem("debug")

export const VideoPlayer = memo(function VideoPlayer(props: VideoPlayerProps) {
  const {
    stream = null,
    initVolume,
    className,
    mute,
    autoplay,
    onPlay,
    onPause,
    onVolumeChange,
    onFullscreenEnter,
    onFullscreenExit,
    children,
    ...other
  } = props
  const [played, setPlayed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [volume, setVolume] = useState(
    getNumberBeetwenTwoValues(initVolume, 0, 1)
  )
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)
  const { handleClose, handleOpen, open } = useIsOpen(3000)

  const [debug, setDebug] = useState(debugValue)
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "F2") {
        setDebug((prev) => !prev)
        debugValue = !debugValue
      }
    }
    document.addEventListener("keydown", fn)
    return () => {
      document.removeEventListener("keydown", fn)
    }
  }, [])

  const handlePause = useCallback(() => {
    videoRef.current?.pause()
    onPause?.()
  }, [onPause])

  const handlePlay = useCallback(() => {
    try {
      videoRef.current?.play()
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

  const handleFullscreen = useCallback(() => {
    try {
      playerRef.current?.requestFullscreen()
      onFullscreenEnter?.()
    } catch (error) {
      console.error(error)
    }
  }, [onFullscreenEnter])
  const handleExitFullscreen = useCallback(() => {
    try {
      document.exitFullscreen()
      onFullscreenExit?.()
    } catch (error) {
      console.error(error)
    }
  }, [onFullscreenExit])
  const handleFullscreenToggle = useCallback((e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (document.fullscreenElement) document.exitFullscreen()
    else playerRef.current?.requestFullscreen()
  }, [])

  const handleRefVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node
      if (!node) return
      if (node.srcObject !== stream) {
        node.srcObject = stream
      }
      node.onplay = () => {
        setPlayed(true)
      }
      node.onpause = () => {
        setPlayed(false)
      }
    },
    [stream]
  )

  const handleRefPlayer = useCallback((node: HTMLDivElement | null) => {
    playerRef.current = node
    if (!node) return

    node.onfullscreenchange = () => {
      if (document.fullscreenElement === node) setFullscreen(true)
      else setFullscreen(false)
    }
  }, [])

  if (videoRef.current) {
    videoRef.current.volume = volume
  }

  const toolsIsClosed = played && !open

  return (
    <div
      className={styles.player}
      ref={handleRefPlayer}
      onFocus={handleOpen}
      onMouseEnter={handleOpen}
      onMouseMove={handleOpen}
      onClick={handleOpen}
      onBlur={handleClose}
      onMouseLeave={handleClose}
    >
      {debug && <VideoPlayerDebugInfo stream={stream} />}
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
        handleFullscreen={handleFullscreen}
        handlePlayPause={handlePlayPause}
      />
      <video
        {...other}
        onDoubleClick={handleFullscreenToggle}
        ref={handleRefVideo}
        className={classNames([styles.video, className], {
          [styles.cursorHide]: toolsIsClosed,
        })}
        playsInline
      />
    </div>
  )
})
