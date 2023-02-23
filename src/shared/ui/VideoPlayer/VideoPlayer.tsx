import { classNames } from "@/shared/lib/classNames/classNames"
import { Button, Slider } from "@mui/material"
import { memo, useCallback, useRef, useState, VideoHTMLAttributes } from "react"
import VolumeDown from "@mui/icons-material/VolumeDown"
import VolumeUp from "@mui/icons-material/VolumeUp"
import styles from "./VideoPlayer.module.scss"
import { Stack } from "@mui/system"
import { getNumberBeetwenTwoValues } from "@/shared/lib/utils/Numbers/getNumberBeetwenTwoValues"
import { downloadBlob } from "@/shared/lib/utils/downloadBlob/downloadBlob"

type VideoPlayerProps = {
  stream: MediaStream | null
  type?: "stream" | "video"
  initVolume?: number
} & VideoHTMLAttributes<HTMLVideoElement>

export const VideoPlayer = memo(function VideoPlayer(props: VideoPlayerProps) {
  const { stream = null, initVolume, className, ...other } = props
  const [open, setOpen] = useState(false)
  const [played, setPlayed] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [volume, setVolume] = useState(
    getNumberBeetwenTwoValues(initVolume, 0, 1)
  )
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<HTMLDivElement | null>(null)

  const hundleClose = useCallback(() => {
    setOpen(false)
  }, [])
  const hundleOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const [recorder, setRecorder] = useState<MediaRecorder>()

  const hundleStartRecordStream = useCallback(() => {
    if (!stream) return
    const recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (e) => {
      downloadBlob(e.data, `${stream.id}`)
      setRecorder(undefined)
    }
    recorder.start()
    setRecorder(recorder)
  }, [stream])
  const hundleStopRecordStream = useCallback(() => {
    recorder?.stop()
    setRecorder(undefined)
  }, [recorder])

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

  return (
    <div
      className={styles.player}
      ref={hundleRefPlayer}
      onFocus={hundleOpen}
      onClick={hundleOpen}
      onMouseEnter={hundleOpen}
      onBlur={hundleClose}
      onMouseLeave={hundleClose}
    >
      <Stack
        direction="row"
        justifyContent="end"
        className={classNames([styles.tooltip, styles.customtooltip], {
          [styles.closed]: !open,
        })}
      >
        {recorder ? (
          <Button variant="contained" onClick={hundleStopRecordStream}>
            stop record
          </Button>
        ) : (
          <Button variant="contained" onClick={hundleStartRecordStream}>
            start record
          </Button>
        )}
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        className={classNames(styles.tooltip, { [styles.closed]: !open })}
      >
        <Button variant="contained" onClick={hundlePlayPause}>
          PlayPause
        </Button>
        <Stack
          className={styles.tooltipVolume}
          spacing={2}
          direction="row"
          alignItems="center"
        >
          <VolumeDown />
          <Slider
            aria-label="Volume"
            value={volume}
            onChange={hundleChangeVolume}
            step={0.01}
            min={0}
            max={1}
          />
          <VolumeUp />
        </Stack>
        {fullscreen ? (
          <Button variant="contained" onClick={hundleExitFullscreen}>
            ExitFullScreen
          </Button>
        ) : (
          <Button variant="contained" onClick={hundleFullscreen}>
            FullScreen
          </Button>
        )}
      </Stack>
      <video
        {...other}
        ref={hundleRefVideo}
        className={classNames([styles.video, className])}
        autoPlay
        playsInline
      />
    </div>
  )
})
