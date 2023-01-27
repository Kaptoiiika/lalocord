import { useCallback, useEffect, useState } from "react"
import { PartsType, WindowParams } from "../../model/types/WindowParams"

type useWindowProps = WindowParams

const getMovementByParts = (draggingPart: PartsType, e: MouseEvent) => {
  switch (draggingPart) {
    case "body":
      return {
        x: e.movementX,
        y: e.movementY,
      }
    case "right":
      return {
        width: e.movementX,
      }

    case "right-top":
      return {
        width: e.movementX,
        y: e.movementY,
        height: e.movementY * -1,
      }

    case "right-bottom":
      return {
        width: e.movementX,
        height: e.movementY,
      }

    case "left":
      return {
        x: e.movementX,
        width: -e.movementX,
      }
    case "left-top":
      return {
        x: e.movementX,
        width: -e.movementX,
        y: e.movementY,
        height: -e.movementY,
      }
    case "left-bottom":
      return {
        x: e.movementX,
        width: -e.movementX,
        height: e.movementY,
      }

    case "top":
      return {
        y: e.movementY,
        height: -e.movementY,
      }
    case "bottom":
      return {
        height: e.movementY,
      }
    default:
      return {}
  }
}

export const useWindow = (windowParams: useWindowProps) => {
  const [windowParam, setWindowParams] = useState<useWindowProps>({
    width: windowParams.width,
    height: windowParams.height,
    x: windowParams.x,
    y: windowParams.y,
    fullScreen: windowParams.fullScreen,
  })
  const [draggingPart, setDraggingPart] = useState<PartsType | null>(null)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingPart) return

      setWindowParams((prev) => {
        const {
          width = 0,
          height = 0,
          y = 0,
          x = 0,
        } = getMovementByParts(draggingPart, e)

        return {
          width: Math.max(prev.width + width, 150),
          height: Math.max(prev.height + height, 150),
          y: Math.max(prev.y + y, -prev.height / 2),
          x: Math.max(prev.x + x, -prev.width / 2),
        }
      })
    },
    [draggingPart]
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>, active: PartsType) => {
      e.stopPropagation()

      setDraggingPart(active)
    },
    []
  )

  const stopResize = useCallback(() => {
    setDraggingPart((prev) => {
      if (prev) return null
      return prev
    })
  }, [])

  const togleFullScreen = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation()
      e.preventDefault()
      setWindowParams((prev) => {
        return {
          ...prev,
          fullScreen: !prev.fullScreen,
        }
      })
    },
    []
  )

  useEffect(() => {
    addEventListener("mousemove", onMouseMove)
    addEventListener("mouseup", stopResize)

    return () => {
      removeEventListener("mousemove", onMouseMove)
      removeEventListener("mouseup", stopResize)
    }
  }, [onMouseMove, stopResize])

  return { onMouseDown, togleFullScreen, ...windowParam }
}
