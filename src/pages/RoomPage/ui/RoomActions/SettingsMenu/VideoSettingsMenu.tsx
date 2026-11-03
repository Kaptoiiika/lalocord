import { Settings } from 'lucide-react'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { bitrateToShortValue, bitrateValueText } from 'src/shared/lib/utils/Numbers'
import { IconButton, InlineSelectPrimitive, Popup, Slider } from 'src/shared/ui'

export const VideoSettingsMenu = () => {
  const bitrate = useWebRTCStore((state) => state.bitrate)
  const setBitrate = useWebRTCStore((state) => state.setBitrate)
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const { open, setOpen, handleOpen } = usePopup()

  const handleBitrateChange = (newValue: number) => {
    setBitrate(newValue * 1024 * 1024)
  }

  const handleChangeFrameRate = (value: string) => {
    const numValue = Number(value)

    if (!numValue) return
    setStreamConstraints({
      video: {
        ...streamConstraints.video,
        frameRate: numValue,
      },
      audio: streamConstraints.audio,
    })
  }

  const handleChangeResolution = (value: string) => {
    const numValue = Number(value)

    if (!numValue) return
    setStreamConstraints({
      video: {
        ...streamConstraints.video,
        height: numValue,
      },
      audio: streamConstraints.audio,
    })
  }

  const currentFrameRate = streamConstraints.video.frameRate

  const frameRateList = ['5', '30', '60']
  const isCustomFrameRate = frameRateList.includes(String(currentFrameRate)) ? '90' : `${currentFrameRate}`

  const currentResolution = streamConstraints.video?.height
  const resolutionList = ['144', '720', '1080']
  const isCustomResolution = resolutionList.includes(String(currentResolution)) ? '1440' : `${currentResolution}`

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      side="top"
      align="center"
      className="min-w-80"
      trigger={
        <IconButton
          tooltip="Settings"
          tooltipSide="top"
          aria-label="Settings"
          onClick={handleOpen}
        >
          <Settings />
        </IconButton>
      }
    >
      <InlineSelectPrimitive
        title={`Frame Rate ${currentFrameRate}`}
        value={`${currentFrameRate}`}
        list={frameRateList}
        onSelect={handleChangeFrameRate}
        allowCustomValue
        customValue={isCustomFrameRate}
        onCustomValueChange={handleChangeFrameRate}
      />
      <InlineSelectPrimitive
        title={`Resolution ${currentResolution}p`}
        value={`${currentResolution}`}
        list={resolutionList}
        onSelect={handleChangeResolution}
        allowCustomValue
        customValue={isCustomResolution}
        onCustomValueChange={handleChangeResolution}
      />

      <div className="flex flex-col gap-2">
        <p className="flex w-full justify-between">
          Max bitrate: <span>{bitrateToShortValue(bitrate || 0)} Mb/s</span>
        </p>
        <Slider
          defaultValue={bitrateToShortValue(bitrate || 0)}
          onValueCommit={handleBitrateChange}
          aria-label="bitrate"
          step={0.1}
          min={0.1}
          max={50}
        />
        <span className="sr-only">{bitrateValueText(bitrateToShortValue(bitrate || 0))}</span>
      </div>
    </Popup>
  )
}
