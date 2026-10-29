import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { useEffect, useRef } from 'react'

import { isClientKey } from 'src/shared/types/ClientEvents'

import type { RemoteControlEvent, RemoteControlMouseButton } from 'src/shared/types/ClientEvents'

import { getVideoRelativePoint } from '../../lib/getVideoRelativePoint'
import { getWheelNotches } from '../../lib/getWheelNotches'

import styles from './RemoteControlLayer.module.scss'

type RemoteControlLayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>
  onControlEvent: (event: RemoteControlEvent) => void
  onExit: () => void
}

type KeyboardLock = {
  lock: () => Promise<void>
  unlock: () => void
}

const getKeyboardLock = () => {
  const navigatorWithKeyboard = navigator as Navigator & { keyboard?: KeyboardLock }

  return navigatorWithKeyboard.keyboard ?? null
}

const pointerButtonToRemote = (button: number): RemoteControlMouseButton | null => {
  if (button === 0) return 'left'
  if (button === 1) return 'middle'
  if (button === 2) return 'right'

  return null
}

export const RemoteControlLayer = (props: RemoteControlLayerProps) => {
  const { videoRef, onControlEvent, onExit } = props
  const layerRef = useRef<HTMLDivElement>(null)
  const onControlEventRef = useRef(onControlEvent)
  const onExitRef = useRef(onExit)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const pendingPointRef = useRef<{ x: number; y: number } | null>(null)
  const frameRef = useRef<number | null>(null)

  onControlEventRef.current = onControlEvent
  onExitRef.current = onExit

  useEffect(() => {
    const release = () => {
      onControlEventRef.current({ type: 'release' })
    }
    const handleBlur = () => {
      release()
    }
    const handleVisibility = () => {
      if (document.hidden) release()
    }
    const lockKeyboard = () => {
      if (!document.fullscreenElement) return

      getKeyboardLock()
        ?.lock()
        .catch((error: unknown) => {
          console.error(error)
        })
    }

    lockKeyboard()
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibility)
    document.addEventListener('fullscreenchange', lockKeyboard)

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibility)
      document.removeEventListener('fullscreenchange', lockKeyboard)
      getKeyboardLock()?.unlock()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      release()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        onExitRef.current()
        return
      }
      if (event.repeat || !isClientKey(event.code)) return

      event.preventDefault()
      event.stopPropagation()
      onControlEventRef.current({ type: 'keydown', code: event.code })
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Escape' || !isClientKey(event.code)) return

      event.preventDefault()
      event.stopPropagation()
      onControlEventRef.current({ type: 'keyup', code: event.code })
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const video = videoRef.current
      if (!video) return

      const point = getVideoRelativePoint(video, event.clientX, event.clientY)
      if (!point) return

      const dx = getWheelNotches(event.deltaX, event.deltaMode)
      const dy = getWheelNotches(event.deltaY, event.deltaMode)
      if (dx === 0 && dy === 0) return

      onControlEventRef.current({ type: 'wheel', dx, dy })
    }

    layer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      layer.removeEventListener('wheel', handleWheel)
    }
  }, [videoRef])

  const readPoint = (event: ReactPointerEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return null

    return getVideoRelativePoint(video, event.clientX, event.clientY)
  }

  const scheduleMove = (point: { x: number; y: number }) => {
    pendingPointRef.current = point
    if (frameRef.current !== null) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      const nextPoint = pendingPointRef.current
      pendingPointRef.current = null
      if (!nextPoint) return

      onControlEventRef.current({ type: 'mousemove', x: nextPoint.x, y: nextPoint.y })
    })
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const button = pointerButtonToRemote(event.button)
    if (!button) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = readPoint(event)
    if (!point) return

    lastPointRef.current = point
    onControlEventRef.current({ type: 'mousedown', x: point.x, y: point.y, button })
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = readPoint(event)
    if (!point) return

    lastPointRef.current = point
    scheduleMove(point)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const button = pointerButtonToRemote(event.button)
    if (!button) return

    const point = readPoint(event) ?? lastPointRef.current
    if (!point) return

    onControlEventRef.current({ type: 'mouseup', x: point.x, y: point.y, button })
  }

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div
      ref={layerRef}
      className={styles.layer}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <div className={styles.hint}>Press Esc to exit remote control</div>
    </div>
  )
}
