import type { ComponentProps } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Skeleton } from 'src/shared/ui/shadcn/skeleton'

type SkeletonTextProps = ComponentProps<typeof Skeleton>

export function SkeletonText(props: SkeletonTextProps) {
  const { className, ...otherProps } = props

  return (
    <Skeleton
      className={cn('h-4 w-full bg-[rgb(var(--secondary-color))]', className)}
      {...otherProps}
    />
  )
}
