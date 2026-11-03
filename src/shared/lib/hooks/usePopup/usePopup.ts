import { useState } from 'react'

export const usePopup = () => {
  const [open, setOpen] = useState(false)

  const handleOpen = (event: { preventDefault: () => void }) => {
    event.preventDefault()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return {
    open,
    setOpen,
    handleOpen,
    handleClose,
  }
}
