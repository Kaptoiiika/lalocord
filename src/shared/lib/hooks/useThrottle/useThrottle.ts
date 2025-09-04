import { useCallback, useRef } from 'react'

export const useThrottle = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any) => void,
  delayInMS: number
) => {
  const throttleRef = useRef(false)

  return useCallback(
    (...args: unknown[]) => {
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
