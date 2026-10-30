import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch,
} from '@mui/material'
import { IpcChannels } from 'electron/main/types/ipcChannels'
import { getLastSelectedSource } from 'electron/renderer/getDisplayMedia/displayMediaSelector'
import { useSettingStore } from 'src/entities/Settings'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { toGameCaptureSettings } from 'src/features/GameSession/lib/captureSettings'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { startViewTransition } from 'src/shared/lib/utils'

import type { OpenOverlayParams } from 'electron/main/types/ipcChannels'

const getOverlayParams = (): OpenOverlayParams | undefined => {
  const source = getLastSelectedSource()
  if (!source) return undefined

  return {
    bounds: source?.bounds,
    sourceId: source?.id,
    isScreen: source?.isScreen,
  }
}

export const ShareScreenMenu = () => {
  const { handleClick, handleClose, anchorEl, open } = usePopup()
  const { overlayDrawEnabled, setOverlayDrawEnabled, allowDrawLine, setAllowDrawLine, allowRemoteControl, setAllowRemoteControl } =
    useSettingStore()
  const screenStream = useWebRTCStore((state) => state.streams.screen)
  const createStream = useWebRTCStore((state) => state.createStream)
  const stopStream = useWebRTCStore((state) => state.stopStream)

  const handleStopStream = async () => {
    handleClose()
    await startViewTransition()
    if (__IS_ELECTRON__) window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionStop, undefined)
    stopStream('screen')
  }

  const handleStartStream = async () => {
    handleClose()
    await startViewTransition()
    const stream = await createStream('screen')
    const params = getOverlayParams()

    if (stream && overlayDrawEnabled && __IS_ELECTRON__ && params?.isScreen) {
      window.electron?.ipcRenderer.sendMessage(IpcChannels.openOverlay, params)
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          window.electron?.ipcRenderer.sendMessage(IpcChannels.closeOverlay, undefined)
        })
      })
    }
  }

  const handleOverlayDrawChange = (enabled: boolean) => {
    setOverlayDrawEnabled(enabled)
    if (!__IS_ELECTRON__ || !screenStream) return
    if (enabled) {
      const params = getOverlayParams()
      window.electron?.ipcRenderer.sendMessage(IpcChannels.openOverlay, params)
    } else {
      window.electron?.ipcRenderer.sendMessage(IpcChannels.closeOverlay, undefined)
    }
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
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                color="primary"
                checked={allowDrawLine}
                onChange={() => setAllowDrawLine(!allowDrawLine)}
              />
            }
            label="Allow draw line"
          />
        </MenuItem>
        {__IS_ELECTRON__ && (
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={overlayDrawEnabled}
                  onChange={() => handleOverlayDrawChange(!overlayDrawEnabled)}
                />
              }
              label="Overlay draw"
            />
          </MenuItem>
        )}
        {__IS_ELECTRON__ && (
          <MenuItem>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={allowRemoteControl}
                  onChange={() => setAllowRemoteControl(!allowRemoteControl)}
                />
              }
              label="Allow remote control"
            />
          </MenuItem>
        )}

        <MenuItem onClick={handleStartStream}>
          <ListItemIcon>
            <ScreenShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{screenStream ? 'Change screen' : 'Share your screen'}</ListItemText>
        </MenuItem>
        {__IS_ELECTRON__ && (
          <MenuItem
            onClick={() => {
              handleClose()
              if (!window.electron) return
              window.electron.ipcRenderer.sendMessage(IpcChannels.closeOverlay, undefined)
              useWebRTCStore.getState().holdGameScreenTile()
              const source = getLastSelectedSource()
              const { streamConstraints, bitrate } = useWebRTCStore.getState()
              window.electron.ipcRenderer.sendMessage(IpcChannels.gameSessionStart, {
                bounds: source?.isScreen ? source.bounds : undefined,
                capture: toGameCaptureSettings(streamConstraints, bitrate),
              })
            }}
          >
            <ListItemIcon>
              <ScreenShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Game session</ListItemText>
          </MenuItem>
        )}
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
