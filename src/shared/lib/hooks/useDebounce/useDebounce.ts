import { useCallback, useRef } from 'react'

export const useDebounce = <T extends unknown[]>(callback: (...args: T) => void, delayInMS: number) => {
  const timer = useRef<ReturnType<typeof setTimeout>>(null)

  return useCallback(
    (...args: T) => {
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
