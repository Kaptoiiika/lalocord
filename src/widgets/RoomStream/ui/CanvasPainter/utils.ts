import type { Point, Stroke } from './types'

/**
 * Получить координаты точки с учётом масштаба canvas (для мыши)
 */
export const getScaledPoint = (
  event: MouseEvent,
  canvas: HTMLCanvasElement | null
): Point | null => {
  const rect = canvas?.getBoundingClientRect()
  if (!canvas || !rect) return null

  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

/**
 * Получить координаты точки с учётом масштаба canvas (для сенсора)
 */
export const getScaledTouchPoint = (
  touch: Touch,
  canvas: HTMLCanvasElement | null
): Point | null => {
  const rect = canvas?.getBoundingClientRect()
  if (!canvas || !rect) return null

  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  }
}

/**
 * Нормализовать координаты в проценты (0-100)
 */
export const normalizePoint = (point: Point, width: number, height: number): Point => ({
  x: Math.max(0, Math.min(100, +((point.x / width) * 100).toFixed(2))),
  y: Math.max(0, Math.min(100, +((point.y / height) * 100).toFixed(2))),
})

/**
 * Преобразовать проценты в абсолютные координаты
 */
export const toAbsolutePoint = (point: Point, width: number, height: number): Point => ({
  x: (Math.max(0, Math.min(100, point.x)) / 100) * width,
  y: (Math.max(0, Math.min(100, point.y)) / 100) * height,
})

/**
 * Нарисовать линию по точкам
 */
export const drawPath = (ctx: CanvasRenderingContext2D, points: Point[]): void => {
  if (points.length < 1) return

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y)
  }

  ctx.stroke()
}

/**
 * Создать новый штрих
 */
export const createStroke = (
  points: Point[],
  color: string,
  width: number
): Stroke => ({
  points,
  opacity: 1,
  timeoutId: null,
  rafId: null,
  color,
  width,
})

/**
 * Очистить таймеры штриха
 */
export const clearStrokeTimers = (stroke: Stroke): void => {
  if (stroke.timeoutId) {
    window.clearTimeout(stroke.timeoutId)
    stroke.timeoutId = null
  }
  if (stroke.rafId) {
    cancelAnimationFrame(stroke.rafId)
    stroke.rafId = null
  }
}

