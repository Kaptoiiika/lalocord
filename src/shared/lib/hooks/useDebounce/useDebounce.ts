import { useCallback, useRef } from "react"

export const useDebounce = (
  callback: (...args: any[]) => void,
  delayInMS: number
) => {
  const timer = useRef<ReturnType<typeof setTimeout>>()

  return useCallback(
    (...args: any[]) => {
      if (timer.current) {
        clearTimeout(timer.current)
      }

      timer.current = setTimeout(() => {
        callback(...args)
      }, delayInMS)
    },
    [callback, delayInMS]
  )
}
