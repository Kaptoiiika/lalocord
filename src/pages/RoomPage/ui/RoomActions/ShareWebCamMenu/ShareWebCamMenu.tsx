import { useCallback, useState } from 'react'

import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import { IconButton, Tooltip, Menu } from '@mui/material'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { FormateError } from 'src/shared/api'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition'

import { SelectCamera } from './SelectCamera/SelectCamera'

export const ShareWebCamMenu = () => {
  const webCamStream = useWebRTCStore((state) => state.streams.webCam)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)
  const { handleClick, handleClose, anchorEl, open } = usePopup()
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

  return (
    <>
      {webCamStream ? (
        <Tooltip
          title={error || 'Turn off camera'}
          arrow
        >
          <IconButton
            color={error ? 'error' : 'default'}
            onClick={handleStopStream}
            onContextMenu={handleClick}
          >
            <VideocamIcon color="success" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title={error || 'Turn on camera'}
          arrow
        >
          <IconButton
            color={error ? 'error' : 'default'}
            onClick={handleStartWebCamStream}
            onContextMenu={handleClick}
          >
            <VideocamOffIcon />
          </IconButton>
        </Tooltip>
      )}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <SelectCamera />
      </Menu>
    </>
  )
}
