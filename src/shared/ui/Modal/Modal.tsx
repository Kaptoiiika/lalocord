import type { PropsWithChildren } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Dialog, DialogContent } from 'src/shared/ui/shadcn/dialog'

export type ModalProps = PropsWithChildren<{
  open: boolean
  onClose?: () => void
  className?: string
}>

export const Modal = (props: ModalProps) => {
  const { open, onClose, className, children } = props

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className={cn(className)}
        showCloseButton
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
