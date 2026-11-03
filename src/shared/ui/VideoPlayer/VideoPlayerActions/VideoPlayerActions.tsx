import { Maximize, Minimize, Pause, Play, Volume1, Volume2 } from 'lucide-react'
import { IconButton } from 'src/shared/ui/IconButton'
import { Slider } from 'src/shared/ui/Slider'

import { VideoPlayerTooltip } from '../VideoPlayerTooltip/VideoPlayerTooltip'

type VideoPlayerActionsProps = {
  stream: MediaStream | null
  open: boolean
  volume?: number
  fullscreen?: boolean
  played?: boolean
  mute?: boolean
  handlePlayPause?: () => void
  handleExitFullscreen?: () => void
  handleFullscreen?: () => void
  handleChangeVolume?: (value: number) => void
}

const hasAudioOnStream = (stream: MediaStream | null) => !!stream?.getAudioTracks().length

const overlayGlyphClassName = 'text-white [filter:drop-shadow(0_0_1px_#000)_drop-shadow(0_1px_2px_rgba(0,0,0,0.9))]'

const overlaySliderClassName =
  '[&_[data-slot=slider-track]]:bg-black/60 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:border-black [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-[0_0_0_1px_#000,0_1px_3px_rgba(0,0,0,0.65)]'

export const VideoPlayerActions = (props: VideoPlayerActionsProps) => {
  const {
    handleExitFullscreen,
    handleFullscreen,
    handlePlayPause,
    handleChangeVolume,
    volume,
    played,
    open,
    mute,
    fullscreen,
    stream,
  } = props

  const hasAudio = hasAudioOnStream(stream)

  return (
    <VideoPlayerTooltip
      className="grid grid-cols-[1fr_minmax(100px,3fr)_1fr] items-center"
      open={open}
      bottom
    >
      <div className="flex flex-row justify-start">
        <IconButton
          isOverlay
          aria-label={played ? 'pause video' : 'play video'}
          onClick={handlePlayPause}
        >
          {played ? <Pause /> : <Play />}
        </IconButton>
      </div>
      {!mute && hasAudio ? (
        <div className="mx-auto flex w-full min-w-[100px] max-w-[300px] flex-row items-center gap-2">
          <Volume1 className={overlayGlyphClassName} />
          <Slider
            className={overlaySliderClassName}
            disabled={mute || !hasAudio}
            aria-label="Volume"
            value={hasAudio ? volume : 0}
            onValueChange={handleChangeVolume}
            step={0.01}
            min={0}
            max={1}
          />
          <Volume2 className={overlayGlyphClassName} />
        </div>
      ) : (
        <div />
      )}
      <div className="flex flex-row justify-end gap-2">
        {fullscreen ? (
          <IconButton
            isOverlay
            aria-label="Exit fullscreen"
            onClick={handleExitFullscreen}
          >
            <Minimize />
          </IconButton>
        ) : (
          <IconButton
            isOverlay
            aria-label="Enter fullscreen"
            onClick={handleFullscreen}
          >
            <Maximize />
          </IconButton>
        )}
      </div>
    </VideoPlayerTooltip>
  )
}
