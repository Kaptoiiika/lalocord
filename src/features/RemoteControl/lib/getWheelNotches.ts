const PIXEL_WHEEL_NOTCH = 100
const PAGE_WHEEL_LINES = 3

export const getWheelNotches = (delta: number, deltaMode: number) => {
  if (!Number.isFinite(delta) || delta === 0) return 0
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) return delta
  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return delta * PAGE_WHEEL_LINES

  return delta / PIXEL_WHEEL_NOTCH
}
