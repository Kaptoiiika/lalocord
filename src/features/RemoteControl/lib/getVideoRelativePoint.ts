type VideoPoint = {
  x: number
  y: number
}

const getContentScale = (objectFit: string, scaleX: number, scaleY: number) => {
  if (objectFit === 'cover') return Math.max(scaleX, scaleY)
  if (objectFit === 'none') return 1
  if (objectFit === 'scale-down') return Math.min(1, scaleX, scaleY)

  return Math.min(scaleX, scaleY)
}

export const getVideoRelativePoint = (
  video: HTMLVideoElement | HTMLCanvasElement,
  clientX: number,
  clientY: number
): VideoPoint | null => {
  const rect = video.getBoundingClientRect()
  const videoWidth = video instanceof HTMLCanvasElement ? video.width : video.videoWidth
  const videoHeight = video instanceof HTMLCanvasElement ? video.height : video.videoHeight

  if (!rect.width || !rect.height || !videoWidth || !videoHeight) return null

  const objectFit = getComputedStyle(video).objectFit
  let contentX = rect.left
  let contentY = rect.top
  let contentWidth = rect.width
  let contentHeight = rect.height
  const isLetterboxed =
    objectFit === 'contain' || objectFit === 'cover' || objectFit === 'none' || objectFit === 'scale-down'

  if (isLetterboxed) {
    const scale = getContentScale(objectFit, rect.width / videoWidth, rect.height / videoHeight)
    contentWidth = videoWidth * scale
    contentHeight = videoHeight * scale
    contentX = rect.left + (rect.width - contentWidth) / 2
    contentY = rect.top + (rect.height - contentHeight) / 2
  }

  if (!contentWidth || !contentHeight) return null

  const x = (clientX - contentX) / contentWidth
  const y = (clientY - contentY) / contentHeight

  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null

  return { x, y }
}
