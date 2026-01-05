import { useRef } from 'react'

import type { CanvasPainterProps } from './types'

import { useWebRTCCanvasDrawing } from './useWebRTCCanvasDrawing'

import styles from './CanvasPainter.module.scss'

const DEFAULT_WIDTH = 2560
const DEFAULT_HEIGHT = 1440
const DEFAULT_FADE_DELAY_MS = 2500
const DEFAULT_FADE_DURATION_MS = 550

export const CanvasPainter = (props: CanvasPainterProps) => {
  const {
    id,
    user,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    fadeDelayMs = DEFAULT_FADE_DELAY_MS,
    fadeDurationMs = DEFAULT_FADE_DURATION_MS,
    needCtrlKey = false,
    isLocal = false,
  } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useWebRTCCanvasDrawing({
    canvasRef,
    id,
    fadeDelayMs,
    fadeDurationMs,
    needCtrlKey,
    user,
    isLocal,
  })

  return (
    <canvas
      id={id}
      className={styles.canvas}
      ref={canvasRef}
      width={width}
      height={height}
    />
  )
}
