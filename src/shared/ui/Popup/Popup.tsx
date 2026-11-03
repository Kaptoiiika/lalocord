import type { PropsWithChildren, ReactNode } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Popover, PopoverAnchor, PopoverContent } from 'src/shared/ui/shadcn/popover'

type PopupSide = 'top' | 'right' | 'bottom' | 'left'
type PopupAlign = 'start' | 'center' | 'end'

type PopupProps = PropsWithChildren<{
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  side?: PopupSide
  align?: PopupAlign
  className?: string
  anchorClassName?: string
}>

export const Popup = (props: PopupProps) => {
  const { open, onOpenChange, trigger, side = 'bottom', align = 'center', className, anchorClassName, children } = props

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      <PopoverAnchor className={cn('inline-flex', anchorClassName)}>{trigger}</PopoverAnchor>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        collisionPadding={12}
        className={cn('w-auto gap-2 p-3', className)}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
