import type { ComponentProps } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Button as ShadcnButton, buttonVariants } from 'src/shared/ui/shadcn/button'

type ButtonProps = ComponentProps<typeof ShadcnButton>

export const Button = (props: ButtonProps) => {
  const { className, type = 'button', ...rest } = props

  return (
    <ShadcnButton
      type={type}
      className={cn('cursor-pointer', className)}
      {...rest}
    />
  )
}

export { buttonVariants }
