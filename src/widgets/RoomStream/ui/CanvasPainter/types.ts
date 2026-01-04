import type { RoomUser } from 'src/features/WebRTCRoom'

export type Point = {
  x: number
  y: number
}

export type Stroke = {
  points: Point[]
  opacity: number
  timeoutId: number | null
  rafId: number | null
  color: string
  width: number
}

export type ExternalLinePayload = {
  points: Point[]
  color: string
  width: number
  userId: string
}

export type CanvasPainterProps = {
  id: string
  width?: number
  height?: number
  fadeDelayMs?: number
  fadeDurationMs?: number
  strokeColor?: string
  strokeWidth?: number
  needCtrlKey?: boolean
  user?: RoomUser
  isLocal?: boolean
}

export type CanvasPainterHandle = {
  drawExternalLine: (payload: ExternalLinePayload) => void
}

