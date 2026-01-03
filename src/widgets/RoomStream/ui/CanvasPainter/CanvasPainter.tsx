import { useEffect, useRef, useCallback } from 'react'

import { useWebRTCRoomStore, type RoomUser } from 'src/features/WebRTCRoom'

import styles from './CanvasPainter.module.scss'

// Это чудо файл написал ИИ
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

type ExternalLinePoint = { x: number; y: number }
type ExternalLinePayload = {
  points: ExternalLinePoint[]
  color: string
  width: number
  userId: string
}

export type CanvasPainterHandle = {
  drawExternalLine: (payload: ExternalLinePayload) => void
}

type Point = { x: number; y: number }
type Stroke = {
  points: Point[]
  opacity: number
  timeoutId: number | null
  rafId: number | null
  color: string
  width: number
}

export const CanvasPainter = (props: CanvasPainterProps) => {
  const {
    id,
    user,
    width = 2560,
    height = 1440,
    fadeDelayMs = 2500,
    fadeDurationMs = 550,
    strokeColor = '#f00',
    strokeWidth = 8,
    needCtrlKey = false,
    isLocal = false,
  } = props
  const roomUsers = useWebRTCRoomStore((state) => state.users)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const strokesRef = useRef<Stroke[]>([])
  const currentPointsRef = useRef<Point[] | null>(null)

  const getScaledPoint = (event: MouseEvent): Point | null => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    if (!canvas || !rect) return null
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    }
  }

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 1) return
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i += 1) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    // Нарисовать накопленные штрихи
    for (const stroke of strokesRef.current) {
      if (stroke.opacity <= 0) continue
      ctx.save()
      ctx.globalAlpha = stroke.opacity
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      drawPath(ctx, stroke.points)
      ctx.restore()
    }
    // Текущий штрих в процессе рисования
    if (currentPointsRef.current && currentPointsRef.current.length > 0) {
      ctx.save()
      ctx.globalAlpha = 1
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      drawPath(ctx, currentPointsRef.current)
      ctx.restore()
    }
  }, [strokeColor, strokeWidth])

  const startFade = useCallback(
    (stroke: Stroke) => {
      // Анимация затухания после задержки
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
            // Удалить штрих по завершении
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
  const drawExternalLine = useCallback(
    (payload: ExternalLinePayload) => {
      const canvas = canvasRef.current
      if (!canvas || !payload?.points?.length) return
      const toAbs = (valuePct: number, total: number) => (Math.max(0, Math.min(100, valuePct)) / 100) * total
      const absPoints: Point[] = payload.points.map((p) => ({
        x: toAbs(p.x, canvas.width),
        y: toAbs(p.y, canvas.height),
      }))
      const stroke: Stroke = {
        points: absPoints,
        opacity: 1,
        timeoutId: null,
        rafId: null,
        color: payload.color,
        width: payload.width,
      }
      strokesRef.current.push(stroke)
      startFade(stroke)
      draw()
    },
    [startFade, draw]
  )

  const sendLine = useCallback(
    (points: { x: number; y: number }[], color: string, widthPx: number) => {
      const canvas = canvasRef.current
      if (!canvas || points.length === 0) return
      const normalize = (value: number, total: number) =>
        Math.max(0, Math.min(100, +((value / total) * 100).toFixed(2)))
      const normalizedPoints = points.map((p) => ({
        x: normalize(p.x, canvas.width),
        y: normalize(p.y, canvas.height),
      }))
      const payload = {
        points: normalizedPoints,
        color,
        width: widthPx,
        userId: user?.id,
      }

      if (!user) return
      user.peer.channelInfo.send(
        JSON.stringify({
          event: 'drawLine',
          message: payload,
        })
      )
    },
    [user]
  )

  useEffect(() => {
    if (!roomUsers || !isLocal) return
    const onChatMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.event === 'drawLine') {
        drawExternalLine(data.message)
      }
    }

    roomUsers.forEach((user) => {
      user.peer.channelInfo.on('onChatMessage', (event: MessageEvent) => {
        const data = JSON.parse(event.data)
        if (data.event === 'drawLine') {
          drawExternalLine(data.message)
        }
      })
    })

    return () => {
      roomUsers.forEach((user) => {
        user.peer.channelInfo.off('onChatMessage', onChatMessage)
      })
    }
  }, [roomUsers, drawExternalLine, isLocal])

  useEffect(() => {
    if (isLocal) return
    const cleanupStrokes = strokesRef.current.slice()
    const handleMouseDown = (event: MouseEvent) => {
      if (needCtrlKey && !event.ctrlKey) return
      const target = event.target as HTMLElement
      const closest = target.closest(`#${id}`)
      if (!closest) return
      isDrawingRef.current = true
      currentPointsRef.current = []
      const p = getScaledPoint(event)
      if (p && currentPointsRef.current) currentPointsRef.current.push(p)
      draw()
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (needCtrlKey && !event.ctrlKey) return
      if (!isDrawingRef.current) return
      const p = getScaledPoint(event)
      if (p && currentPointsRef.current) {
        currentPointsRef.current.push(p)
        draw()
      }
    }

    const handleMouseUp = () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      if (currentPointsRef.current && currentPointsRef.current.length > 1) {
        const stroke: Stroke = {
          points: currentPointsRef.current.slice(),
          opacity: 1,
          timeoutId: null,
          rafId: null,
          color: strokeColor,
          width: strokeWidth,
        }
        strokesRef.current.push(stroke)
        sendLine(stroke.points, stroke.color, stroke.width)
        startFade(stroke)
      }
      currentPointsRef.current = null
      draw()
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // Очистить все таймеры/анимации
      for (const s of cleanupStrokes) {
        if (s.timeoutId) {
          window.clearTimeout(s.timeoutId)
          s.timeoutId = null
        }
        if (s.rafId) {
          cancelAnimationFrame(s.rafId)
          s.rafId = null
        }
      }
    }
  }, [id, fadeDelayMs, fadeDurationMs, strokeColor, strokeWidth, draw, startFade, needCtrlKey, sendLine, isLocal])

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

