import { MonitorUp, MonitorX } from 'lucide-react'
import { IpcChannels } from 'electron/main/types/ipcChannels'
import { getLastSelectedSource } from 'electron/renderer/getDisplayMedia/displayMediaSelector'
import { useSettingStore } from 'src/entities/Settings'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { startViewTransition } from 'src/shared/lib/utils'
import { Button, IconButton, Popup, SwitchField } from 'src/shared/ui'

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
  const { handleOpen, handleClose, open, setOpen } = usePopup()
  const {
    overlayDrawEnabled,
    setOverlayDrawEnabled,
    allowDrawLine,
    setAllowDrawLine,
    allowRemoteControl,
    setAllowRemoteControl,
  } = useSettingStore()
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

  const tooltipTitle = screenStream ? 'Stop share' : 'Share your screen'
  const handleClick = screenStream ? handleStopStream : handleStartStream
  const screenIcon = screenStream ? <MonitorUp /> : <MonitorX />

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
          aria-label={tooltipTitle}
          isActive={Boolean(screenStream)}
          onClick={handleClick}
          onContextMenu={handleOpen}
        >
          {screenIcon}
        </IconButton>
      }
    >
      <SwitchField
        label="Allow draw line"
        checked={allowDrawLine}
        onCheckedChange={setAllowDrawLine}
      />
      {__IS_ELECTRON__ && (
        <SwitchField
          label="Overlay draw"
          checked={overlayDrawEnabled}
          onCheckedChange={handleOverlayDrawChange}
        />
      )}
      {__IS_ELECTRON__ && (
        <SwitchField
          label="Allow remote control"
          checked={allowRemoteControl}
          onCheckedChange={setAllowRemoteControl}
        />
      )}
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={handleStartStream}
      >
        <MonitorUp />
        {screenStream ? 'Change screen' : 'Share your screen'}
      </Button>
      {!!screenStream && (
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleStopStream}
        >
          <MonitorX />
          Stop share
        </Button>
      )}
    </Popup>
  )
}
