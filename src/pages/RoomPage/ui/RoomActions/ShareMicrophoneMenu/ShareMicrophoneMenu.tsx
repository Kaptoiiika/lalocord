import { useCallback, useState } from 'react'

import { Mic, MicOff } from 'lucide-react'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { FormateError } from 'src/shared/api'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { IconButton, Popup, SwitchField } from 'src/shared/ui'

import { SelectMicrophone } from './SelectMicrophone'

export const ShareMicrophoneMenu = () => {
  const { handleOpen, open, setOpen } = usePopup()
  const autoOn = useWebRTCStore((state) => state.autoOnMic)
  const micStream = useWebRTCStore((state) => state.streams.mic)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)
  const setAutoOnMic = useWebRTCStore((state) => state.setAutoOnMic)
  const streamConstraints = useWebRTCStore((state) => state.streamConstraints)
  const noiseSuppression = useWebRTCStore((state) => state.streamConstraints.audio.noiseSuppression)
  const echoCancellation = useWebRTCStore((state) => state.streamConstraints.audio.echoCancellation)
  const autoGainControl = useWebRTCStore((state) => state.streamConstraints.audio.autoGainControl)
  const setStreamConstraints = useWebRTCStore((state) => state.setStreamConstraints)
  const [error, setError] = useState<React.ReactNode>('')

  const handleStopStream = useCallback(async () => {
    stopStream('mic')
  }, [stopStream])

  const handleStartStream = useCallback(async () => {
    await createStream('mic')
      .then(() => {
        setError('')
      })
      .catch((err) => {
        setError(
          <>
            Error starting microphone stream
            <br />
            {FormateError(err)}
          </>
        )
      })
  }, [createStream])

  const handleChangeAudioSettings = useCallback(
    (name: 'noiseSuppression' | 'echoCancellation' | 'autoGainControl', checked: boolean) => {
      setStreamConstraints({
        ...streamConstraints,
        audio: {
          ...streamConstraints.audio,
          [name]: checked,
        },
      })
    },
    [setStreamConstraints, streamConstraints]
  )

  useMountedEffect(() => {
    if (autoOn) handleStartStream()
  })

  const tooltipTitle = error || (micStream ? 'Turn off microphone' : 'Turn on microphone')
  const handleClick = micStream ? handleStopStream : handleStartStream
  const microphoneIcon = micStream ? <Mic /> : <MicOff />

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      side="top"
      align="center"
      trigger={
        <IconButton
          tooltip={tooltipTitle}
          tooltipSide="top"
          isError={Boolean(error)}
          isActive={Boolean(micStream)}
          onClick={handleClick}
          onContextMenu={handleOpen}
        >
          {microphoneIcon}
        </IconButton>
      }
    >
      <div className="flex flex-col gap-2">
        <p>Audio settings</p>
        <SwitchField
          label="Auto on microphone"
          checked={autoOn}
          onCheckedChange={setAutoOnMic}
        />
        <SwitchField
          name="noiseSuppression"
          label="Noise suppression"
          checked={Boolean(noiseSuppression)}
          onCheckedChange={(checked) => handleChangeAudioSettings('noiseSuppression', checked)}
        />
        <SwitchField
          name="echoCancellation"
          label="Echo cancellation"
          checked={Boolean(echoCancellation)}
          onCheckedChange={(checked) => handleChangeAudioSettings('echoCancellation', checked)}
        />
        <SwitchField
          name="autoGainControl"
          label="Auto gain control"
          checked={Boolean(autoGainControl)}
          onCheckedChange={(checked) => handleChangeAudioSettings('autoGainControl', checked)}
        />
      </div>
      <SelectMicrophone />
    </Popup>
  )
}
