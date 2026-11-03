import { useCallback, useState } from 'react'

import { Video, VideoOff } from 'lucide-react'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { FormateError } from 'src/shared/api'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition'
import { IconButton, Popup } from 'src/shared/ui'

import { SelectCamera } from './SelectCamera/SelectCamera'

export const ShareWebCamMenu = () => {
  const webCamStream = useWebRTCStore((state) => state.streams.webCam)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)
  const { handleOpen, open, setOpen } = usePopup()
  const [error, setError] = useState<React.ReactNode>('')

  const handleStartWebCamStream = async () => {
    await startViewTransition()
    await createStream('webCam')
      .then(() => {
        setError('')
      })
      .catch((err) => {
        setError(
          <>
            Error starting web cam stream
            <br />
            {FormateError(err)}
          </>
        )
      })
  }

  const handleStopStream = useCallback(async () => {
    await startViewTransition()
    stopStream('webCam')
  }, [stopStream])

  const tooltipTitle = error || (webCamStream ? 'Turn off camera' : 'Turn on camera')
  const handleClick = webCamStream ? handleStopStream : handleStartWebCamStream
  const cameraIcon = webCamStream ? <Video /> : <VideoOff />

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
          isActive={Boolean(webCamStream)}
          onClick={handleClick}
          onContextMenu={handleOpen}
        >
          {cameraIcon}
        </IconButton>
      }
    >
      <SelectCamera />
    </Popup>
  )
}
