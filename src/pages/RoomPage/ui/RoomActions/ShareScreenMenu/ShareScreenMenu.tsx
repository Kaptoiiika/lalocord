import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { startViewTransition } from 'src/shared/lib/utils'

export const ShareScreenMenu = () => {
  const { handleClick, handleClose, anchorEl, open } = usePopup()
  const screenStream = useWebRTCStore((state) => state.streams.screen)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)

  const handleStopStream = async () => {
    handleClose()
    await startViewTransition()
    stopStream('screen')
  }

  const handleStartStream = async () => {
    handleClose()
    await startViewTransition()
    await createStream('screen')
  }

  return (
    <>
      {!screenStream ? (
        <Tooltip
          title="Share your screen"
          arrow
        >
          <IconButton
            aria-label="Share your screen"
            onClick={handleStartStream}
            onContextMenu={handleClick}
          >
            <StopScreenShareIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title="Stop share"
          arrow
        >
          <IconButton
            aria-label="Stop share"
            onClick={handleStopStream}
            onContextMenu={handleClick}
          >
            <ScreenShareIcon color="success" />
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
        <MenuItem onClick={handleStartStream}>
          <ListItemIcon>
            <ScreenShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{screenStream ? 'Change screen' : 'Share your screen'}</ListItemText>
        </MenuItem>
        {!!screenStream && (
          <MenuItem onClick={handleStopStream}>
            <ListItemIcon>
              <StopScreenShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Stop share</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
