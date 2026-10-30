import type { MediaSource, MediaSourceBounds } from '../get_media_source/get_media_source'
import type { ExternalLinePayload } from 'src/features/CanvasPainter/ui/CanvasPainter'
import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'
import type { GameCaptureSettings, GameSessionOffer, GameSessionStats } from 'src/shared/types/GameSession'

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
  gameSessionStart = 'gameSessionStart',
  gameSessionConfigure = 'gameSessionConfigure',
  gameSessionStop = 'gameSessionStop',
  gameSessionReady = 'gameSessionReady',
  gameSessionEnded = 'gameSessionEnded',
  gameSessionStats = 'gameSessionStats',
  gameSessionFailed = 'gameSessionFailed',
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
  gameSessionStart: { bounds?: MediaSourceBounds; capture?: GameCaptureSettings }
  gameSessionConfigure: GameCaptureSettings
  gameSessionStop: void
  gameSessionReady: void
  gameSessionEnded: void
  gameSessionStats: void
  gameSessionFailed: void
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
  gameSessionStart: void
  gameSessionConfigure: void
  gameSessionStop: void
  gameSessionReady: GameSessionOffer
  gameSessionEnded: void
  gameSessionStats: GameSessionStats
  gameSessionFailed: string
}
