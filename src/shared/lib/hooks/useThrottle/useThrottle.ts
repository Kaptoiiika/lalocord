import { useCallback, useRef } from 'react'

export const useThrottle = <T extends unknown[]>(
  callback: (...args: T) => void,
  delayInMS: number
) => {
  const throttleRef = useRef(false)

  return useCallback(
    (...args: T) => {
      if (throttleRef.current === false) {
        callback(...args)
        throttleRef.current = true

        setTimeout(() => {
          throttleRef.current = false
        }, delayInMS)
      }
    },
    [callback, delayInMS]
  )
}
