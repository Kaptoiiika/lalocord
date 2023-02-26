import { useCallback, useEffect, useRef, useState } from "react"

/**
 *
 *
 * @param {number} [time] in ms to execute hundleClose() after hundleOpen()
 * @return open, hundleClose, hundleOpen
 */
export const useIsOpen = (time?: number) => {
  const [open, setOpen] = useState(false)
  const openRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => clearTimeout(openRef.current)
  }, [])

  const hundleClose = useCallback(() => {
    setOpen(false)
    clearTimeout(openRef.current)
  }, [])

  const hundleOpen = useCallback(() => {
    setOpen(true)
    clearTimeout(openRef.current)
    if (time) {
      openRef.current = setTimeout(() => {
        setOpen(false)
      }, time)
    }
  }, [time])

  return { open, hundleClose, hundleOpen }
}
