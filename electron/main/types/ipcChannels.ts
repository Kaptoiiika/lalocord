import type { MediaSource, MediaSourceBounds } from '../get_media_source/get_media_source'
import type { ExternalLinePayload } from 'src/features/CanvasPainter/ui/CanvasPainter'
import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'

export interface OpenOverlayParams {
  bounds?: MediaSourceBounds
  sourceId?: string
  isScreen?: boolean
}

export interface RemoteControlStartParams {
  bounds: MediaSourceBounds
}

export const enum IpcChannels {
  getMediaSource = 'getMediaSource',
  drawOverlayLine = 'drawOverlayLine',
  openOverlay = 'openOverlay',
  closeOverlay = 'closeOverlay',
  remoteControlStart = 'remoteControlStart',
  remoteControlStop = 'remoteControlStop',
  remoteControlInput = 'remoteControlInput',
}

export type IpcEventMap<T> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  getMediaSource: void
  drawOverlayLine: ExternalLinePayload
  openOverlay: OpenOverlayParams | void
  closeOverlay: void
  remoteControlStart: RemoteControlStartParams
  remoteControlStop: void
  remoteControlInput: RemoteControlEvent
}

//renderer sendMessage(key, (value)=>{})
export interface IpcToRendererEventMap {
  getMediaSource: MediaSource[]
  drawOverlayLine: ExternalLinePayload
  openOverlay: void
  closeOverlay: void
  remoteControlStart: void
  remoteControlStop: void
  remoteControlInput: void
}
