import { useCallback, useEffect, useRef, useState } from "react"

export interface UseIsOpenProps {
  time?: number
  prevents?: boolean
}

export const useIsOpen = (props: UseIsOpenProps = {}) => {
  const { prevents, time } = props
  const [open, setOpen] = useState(false)
  const [top, setTop] = useState<number | undefined>()
  const [left, setLeft] = useState<number | undefined>()
  const [anchorEl, setAnchorEl] = useState<Element | undefined>()
  const openRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    return () => clearTimeout(openRef.current)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    clearTimeout(openRef.current)
  }, [])

  const handleOpen = useCallback(
    (e?: React.MouseEvent) => {
      setOpen(true)
      clearTimeout(openRef.current)
      setAnchorEl(e?.currentTarget)
      setTop(e?.clientY)
      setLeft(e?.clientX)
      if (prevents) e?.preventDefault()
      if (time) {
        openRef.current = setTimeout(() => {
          handleClose()
        }, time)
      }
    },
    [prevents, time, handleClose]
  )

  const handleToggle = useCallback(
    (e?: React.MouseEvent) => {
      if (open) {
        handleClose()
      } else {
        handleOpen(e)
      }
    },
    [handleClose, handleOpen, open]
  )

  return {
    open,
    top,
    left,
    anchorEl,
    handleToggle,
    handleClose,
    handleOpen,
  }
}
