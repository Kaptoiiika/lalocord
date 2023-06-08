import { useCallback, useEffect, useRef, useState } from "react"

/**
 *
 *
 * @param {number} [time] in ms to execute handleClose() after handleOpen()
 * @return open, handleClose, handleOpen
 */
export const useIsOpen = (time?: number) => {
  const [open, setOpen] = useState(false)
  const openRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => clearTimeout(openRef.current)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    clearTimeout(openRef.current)
  }, [])

  const handleOpen = useCallback(() => {
    setOpen(true)
    clearTimeout(openRef.current)
    if (time) {
      openRef.current = setTimeout(() => {
        setOpen(false)
      }, time)
    }
  }, [time])

  const handleToggle = useCallback(() => {
    if (open) {
      handleClose()
    } else {
      handleOpen()
    }
  }, [handleClose, handleOpen, open])

  return { open, handleToggle, handleClose, handleOpen }
}
