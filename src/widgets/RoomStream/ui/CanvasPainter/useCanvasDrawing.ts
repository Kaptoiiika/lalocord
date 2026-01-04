import { useEffect, useRef, useCallback } from 'react'

import type { Point, Stroke, ExternalLinePayload } from './types'

import { getScaledPoint, getScaledTouchPoint, normalizePoint, toAbsolutePoint, drawPath, createStroke, clearStrokeTimers } from './utils'

type UseCanvasDrawingOptions = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  id: string
  fadeDelayMs: number
  fadeDurationMs: number
  strokeColor: string
  strokeWidth: number
  needCtrlKey: boolean
  enabled: boolean
  onLineDraw?: (payload: Omit<ExternalLinePayload, 'userId'>) => void
}

export const useCanvasDrawing = (options: UseCanvasDrawingOptions) => {
  const { canvasRef, id, fadeDelayMs, fadeDurationMs, strokeColor, strokeWidth, needCtrlKey, enabled, onLineDraw } =
    options

  const isDrawingRef = useRef(false)
  const strokesRef = useRef<Stroke[]>([])
  const currentPointsRef = useRef<Point[] | null>(null)

  /**
   * Перерисовать canvas
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    // Отрисовать сохранённые штрихи
    strokesRef.current.forEach((stroke) => {
      if (stroke.opacity <= 0) return

      ctx.save()
      ctx.globalAlpha = stroke.opacity
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      drawPath(ctx, stroke.points)
      ctx.restore()
    })

    // Текущий штрих (в процессе рисования)
    const currentPoints = currentPointsRef.current
    if (currentPoints && currentPoints.length > 0) {
      ctx.save()
      ctx.globalAlpha = 1
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      drawPath(ctx, currentPoints)
      ctx.restore()
    }
  }, [canvasRef, strokeColor, strokeWidth])

  /**
   * Запустить анимацию затухания штриха
   */
  const startFade = useCallback(
    (stroke: Stroke) => {
      stroke.timeoutId = window.setTimeout(() => {
        let startTs: number | null = null

        const step = (ts: number) => {
          if (startTs === null) startTs = ts

          const elapsed = ts - startTs
          const progress = Math.min(1, elapsed / fadeDurationMs)
          stroke.opacity = 1 - progress
          draw()

          if (progress < 1) {
            stroke.rafId = requestAnimationFrame(step)
          } else {
            const idx = strokesRef.current.indexOf(stroke)
            if (idx !== -1) {
              strokesRef.current.splice(idx, 1)
              draw()
            }
            stroke.rafId = null
          }
        }

        stroke.rafId = requestAnimationFrame(step)
      }, fadeDelayMs)
    },
    [fadeDelayMs, fadeDurationMs, draw]
  )

  /**
   * Нарисовать линию извне (например, от другого пользователя)
   */
  const drawExternalLine = useCallback(
    (payload: ExternalLinePayload) => {
      const canvas = canvasRef.current
      if (!canvas || !payload?.points?.length) return

      const absPoints = payload.points.map((p) => toAbsolutePoint(p, canvas.width, canvas.height))

      const stroke = createStroke(absPoints, payload.color, payload.width)
      strokesRef.current.push(stroke)
      startFade(stroke)
      draw()
    },
    [canvasRef, startFade, draw]
  )

  /**
   * Очистить все штрихи
   */
  const clearStrokes = useCallback(() => {
    strokesRef.current.forEach(clearStrokeTimers)
    strokesRef.current = []
    draw()
  }, [draw])

  // Обработка событий мыши для рисования
  useEffect(() => {
    if (!enabled) return

    const cleanupStrokes = strokesRef.current.slice()

    const handleMouseDown = (event: MouseEvent) => {
      if (needCtrlKey && !event.ctrlKey) return

      const target = event.target as HTMLElement
      if (!target.closest(`#${id}`)) return

      isDrawingRef.current = true
      currentPointsRef.current = []

      const point = getScaledPoint(event, canvasRef.current)
      if (point) currentPointsRef.current.push(point)
      draw()
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (needCtrlKey && !event.ctrlKey) return
      if (!isDrawingRef.current || !currentPointsRef.current) return

      const point = getScaledPoint(event, canvasRef.current)
      if (point) {
        currentPointsRef.current.push(point)
        draw()
      }
    }

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return

      isDrawingRef.current = false

      const canvas = canvasRef.current
      const currentPoints = currentPointsRef.current

      if (currentPoints && currentPoints.length > 1) {
        const stroke = createStroke(currentPoints.slice(), strokeColor, strokeWidth)
        strokesRef.current.push(stroke)
        startFade(stroke)

        // Отправить линию наружу
        if (onLineDraw && canvas) {
          const normalizedPoints = currentPoints.map((p) => normalizePoint(p, canvas.width, canvas.height))
          onLineDraw({
            points: normalizedPoints,
            color: strokeColor,
            width: strokeWidth,
          })
        }
      }

      currentPointsRef.current = null
      draw()
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (needCtrlKey) return // Сенсор не поддерживает Ctrl

      const target = event.target as HTMLElement
      if (!target.closest(`#${id}`)) return

      // Предотвращаем скролл при рисовании
      event.preventDefault()

      isDrawingRef.current = true
      currentPointsRef.current = []

      const touch = event.touches[0]
      if (touch) {
        const point = getScaledTouchPoint(touch, canvasRef.current)
        if (point) currentPointsRef.current.push(point)
        draw()
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (needCtrlKey) return
      if (!isDrawingRef.current || !currentPointsRef.current) return

      event.preventDefault()

      const touch = event.touches[0]
      if (touch) {
        const point = getScaledTouchPoint(touch, canvasRef.current)
        if (point) {
          currentPointsRef.current.push(point)
          draw()
        }
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (!isDrawingRef.current) return

      event.preventDefault()

      isDrawingRef.current = false

      const canvas = canvasRef.current
      const currentPoints = currentPointsRef.current

      if (currentPoints && currentPoints.length > 1) {
        const stroke = createStroke(currentPoints.slice(), strokeColor, strokeWidth)
        strokesRef.current.push(stroke)
        startFade(stroke)

        // Отправить линию наружу
        if (onLineDraw && canvas) {
          const normalizedPoints = currentPoints.map((p) => normalizePoint(p, canvas.width, canvas.height))
          onLineDraw({
            points: normalizedPoints,
            color: strokeColor,
            width: strokeWidth,
          })
        }
      }

      currentPointsRef.current = null
      draw()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)

      cleanupStrokes.forEach(clearStrokeTimers)
    }
  }, [id, canvasRef, needCtrlKey, strokeColor, strokeWidth, enabled, draw, startFade, onLineDraw])

  return {
    drawExternalLine,
    clearStrokes,
  }
}

