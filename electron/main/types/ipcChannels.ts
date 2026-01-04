import type { ClientKeyPressEvent } from 'src/shared/types/ClientEvents'
import type { ExternalLinePayload } from 'src/widgets/RoomStream/ui/CanvasPainter'


export const enum IpcChannels {
  getMediaSource = 'getMediaSource',
  keypress = 'keypress',
  keyRelease = 'keyRelease',
  drawOverlayLine = 'drawOverlayLine',
}

export type IpcEventMap<T> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  getMediaSource: void
  keyRelease: void
  keypress: ClientKeyPressEvent
  drawOverlayLine: ExternalLinePayload
}

//renderer sendMessage(key, (value)=>{})
export interface IpcToRendererEventMap {
  getMediaSource: Electron.DesktopCapturerSource[]
  keyRelease: void
  keypress: void
  drawOverlayLine: ExternalLinePayload
}
