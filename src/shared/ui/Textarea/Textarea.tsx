import type { ComponentProps } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Textarea as ShadcnTextarea } from 'src/shared/ui/shadcn/textarea'

type TextareaProps = ComponentProps<'textarea'>

export const Textarea = (props: TextareaProps) => {
  const { className, rows = 1, ...rest } = props

  return (
    <ShadcnTextarea
      rows={rows}
      className={cn(
        'max-h-[calc(1.25rem*3+0.5rem*2)] min-h-[calc(1.25rem+0.5rem*2)] resize-none overflow-y-auto py-2 text-sm leading-5 [field-sizing:content] md:text-sm',
        className
      )}
      {...rest}
    />
  )
}
