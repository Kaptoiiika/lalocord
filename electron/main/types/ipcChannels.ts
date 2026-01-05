import type { MediaSource } from '../get_media_source/get_media_source'
import type { ExternalLinePayload } from 'src/features/CanvasPainter/ui/CanvasPainter'
import type { ClientKeyPressEvent } from 'src/shared/types/ClientEvents'


export const enum IpcChannels {
  getMediaSource = 'getMediaSource',
  keypress = 'keypress',
  keyRelease = 'keyRelease',
  drawOverlayLine = 'drawOverlayLine',
  openOverlay = 'openOverlay',
  closeOverlay = 'closeOverlay',
}

export type IpcEventMap<T> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  getMediaSource: void
  keyRelease: void
  keypress: ClientKeyPressEvent
  drawOverlayLine: ExternalLinePayload
  openOverlay: void
  closeOverlay: void
}

//renderer sendMessage(key, (value)=>{})
export interface IpcToRendererEventMap {
  getMediaSource: MediaSource[]
  keyRelease: void
  keypress: void
  drawOverlayLine: ExternalLinePayload
  openOverlay: void
  closeOverlay: void
}
