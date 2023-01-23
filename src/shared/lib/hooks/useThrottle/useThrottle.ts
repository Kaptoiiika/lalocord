import { useCallback, useRef } from "react"

export const useThrottle = (
  callback: (...args: any[]) => void,
  delayInMS: number
) => {
  const throttleRef = useRef(false)

  return useCallback((...args: any[]) => {
    if (throttleRef.current === false) {
      callback(...args)
      throttleRef.current = true

      setTimeout(() => {
        throttleRef.current = false
      }, delayInMS)
    }
  }, [callback, delayInMS])
}
