import type { PropsWithChildren } from 'react'

import { cn } from 'src/shared/lib/utils/cn'

type CounterBadgeProps = PropsWithChildren<{
  count: number
  className?: string
}>

export const CounterBadge = (props: CounterBadgeProps) => {
  const { count, className, children } = props

  return (
    <span className={cn('relative inline-flex', className)}>
      {children}
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] leading-none text-secondary-foreground">
          {count}
        </span>
      )}
    </span>
  )
}
