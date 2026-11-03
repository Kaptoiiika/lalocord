import type { ReactElement, ReactNode } from 'react'

import { Tooltip as TooltipRoot, TooltipContent, TooltipTrigger } from 'src/shared/ui/shadcn/tooltip'

type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

type TooltipProps = {
  title: ReactNode
  side?: TooltipSide
  children: ReactElement
}

export const Tooltip = (props: TooltipProps) => {
  const { title, side = 'bottom', children } = props

  if (!title) return children

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{title}</TooltipContent>
    </TooltipRoot>
  )
}

export { TooltipProvider } from 'src/shared/ui/shadcn/tooltip'
