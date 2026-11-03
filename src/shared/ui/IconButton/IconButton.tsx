import type { ComponentProps, ReactNode } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Button } from 'src/shared/ui/shadcn/button'

import { Tooltip } from '../Tooltip'

type IconButtonProps = ComponentProps<typeof Button> & {
  tooltip?: ReactNode
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
  isError?: boolean
  isOverlay?: boolean
  isActive?: boolean
}

const overlayClassName =
  'bg-black/45 text-white ring-1 ring-white/85 hover:bg-black/65 hover:text-white focus-visible:ring-white [&_svg]:[filter:drop-shadow(0_0_1px_#000)_drop-shadow(0_1px_2px_rgba(0,0,0,0.9))]'

const activeClassName = 'text-[#2e7d32] hover:text-[#2e7d32] [&_svg]:stroke-[2.5]'

export const IconButton = (props: IconButtonProps) => {
  const { tooltip, tooltipSide, isError, isOverlay, isActive, className, type = 'button', variant, ...rest } = props
  const buttonVariant = isError ? 'destructive' : variant || 'ghost'

  const button = (
    <Button
      {...rest}
      type={type}
      size="icon"
      variant={buttonVariant}
      className={cn(
        "size-10 active:translate-y-0! [&_svg:not([class*='size-'])]:size-5",
        isOverlay && overlayClassName,
        isActive && activeClassName,
        className
      )}
    />
  )

  if (!tooltip) return button

  return (
    <Tooltip
      title={tooltip}
      side={tooltipSide}
    >
      {button}
    </Tooltip>
  )
}
