import type { ComponentProps } from 'react'

import { cn } from 'src/shared/lib/utils/cn'

type TextLinkProps = ComponentProps<'a'>

export const TextLink = (props: TextLinkProps) => {
  const { className, ...rest } = props

  return (
    <a
      className={cn('text-primary underline-offset-4 hover:underline', className)}
      {...rest}
    />
  )
}
