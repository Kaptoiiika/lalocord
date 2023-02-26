import { classNames } from "@/shared/lib/classNames/classNames"
import { IconButton, Slider } from "@mui/material"
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  VideoHTMLAttributes,
} from "react"
import VolumeDown from "@mui/icons-material/VolumeDown"
import VolumeUp from "@mui/icons-material/VolumeUp"
import styles from "./VideoPlayer.module.scss"
import { Stack } from "@mui/system"
import { getNumberBeetwenTwoValues } from "@/shared/lib/utils/Numbers/getNumberBeetwenTwoValues"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"
import { VideoPlayerDebugInfo } from "./VideoPlayerDebugInfo/VideoPlayerDebugInfo"

type VideoPlayerProps = {
  stream: MediaStream | null
  initVolume?: number
} & VideoHTMLAttributes<HTMLVideoElement>

const hasAudioOnStream = (stream: MediaStream | null) => {
  return !!stream?.getAudioTracks().length
}

let debugValue = !!localStorage.getItem('debug')

export const VideoPlayer = memo(function VideoPlayer(props: VideoPlayerProps) {
  const { stream = null, initVolume, className, ...other } = props
  const [played, setPlayed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [volume, setVolume] = useState(
    getNumberBeetwenTwoValues(initVolume, 0, 1)
  )
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)

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

  //todo: replace to hooks
  const [open, setOpen] = useState(false)
  const openRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    return () => clearTimeout(openRef.current)
  }, [])
  const hundleClose = useCallback(() => {
    setOpen(false)
    clearTimeout(openRef.current)
  }, [])
  const hundleOpen = useCallback(() => {
    setOpen(true)
    clearTimeout(openRef.current)
    openRef.current = setTimeout(() => {
      setOpen(false)
    }, 3000)
  }, [])
  //: replace to hooks

  const hundlePlayPause = useCallback(() => {
    if (!videoRef.current) return
    try {
      if (played) videoRef.current.pause()
      else videoRef.current.play()
    } catch (error) {}
  }, [played])

  const hundleChangeVolume = useCallback(
    (event: Event, newValue: number | number[]) => {
      if (videoRef.current && !Array.isArray(newValue))
        videoRef.current.volume = newValue
    },
    []
  )

  const hundleFullscreen = () => {
    try {
      playerRef.current?.requestFullscreen()
    } catch (error) {}
  }

  const hundleExitFullscreen = () => {
    try {
      document.exitFullscreen()
    } catch (error) {}
  }

  const hundleRefVideo = useCallback(
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
      node.onvolumechange = (e) => {
        setVolume(node.volume)
      }
    },
    [stream]
  )

  const hundleRefPlayer = useCallback((node: HTMLDivElement | null) => {
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

  const toolTipIsClosed = played && !open

  return (
    <div
      className={styles.player}
      ref={hundleRefPlayer}
      onFocus={hundleOpen}
      onMouseEnter={hundleOpen}
      onMouseMove={hundleOpen}
      onClick={hundleOpen}
      onBlur={hundleClose}
      onMouseLeave={hundleClose}
    >
      {debug && <VideoPlayerDebugInfo stream={stream} />}
      <div
        className={classNames("", { [styles.tooltipShadow]: !toolTipIsClosed })}
      >
        <div className={styles.tooltipShadowBottom} />
      </div>
      <div
        className={classNames(styles.tooltip, {
          [styles.closed]: toolTipIsClosed,
        })}
      >
        <Stack direction="row" justifyContent="flex-start">
          <IconButton
            aria-label={played ? "pause video" : "play video"}
            onClick={hundlePlayPause}
          >
            {played ? (
              <PauseIcon color="primary" />
            ) : (
              <PlayArrowIcon color="primary" />
            )}
          </IconButton>
        </Stack>
        <Stack
          className={styles.tooltipVolume}
          spacing={2}
          direction="row"
          alignItems="center"
        >
          <VolumeDown color={"primary"} />
          <Slider
            disabled={!hasAudioOnStream(stream)}
            aria-label="Volume"
            value={hasAudioOnStream(stream) ? volume : 0}
            onChange={hundleChangeVolume}
            step={0.01}
            min={0}
            max={1}
          />
          <VolumeUp color="primary" />
        </Stack>
        <Stack direction="row" justifyContent="flex-end" gap={2}>
          {fullscreen ? (
            <IconButton
              aria-label="Exit fullscreen"
              onClick={hundleExitFullscreen}
            >
              <FullscreenExitIcon color="primary" />
            </IconButton>
          ) : (
            <IconButton
              aria-label="enter video to fullscreen"
              onClick={hundleFullscreen}
            >
              <FullscreenIcon color="primary" />
            </IconButton>
          )}
        </Stack>
      </div>
      <video
        {...other}
        ref={hundleRefVideo}
        className={classNames([styles.video, className], {
          [styles.cursorHide]: toolTipIsClosed,
        })}
        autoPlay
        playsInline
      />
    </div>
  )
})
