import type { ComponentProps } from 'react'
import { useId } from 'react'

import { Input } from 'src/shared/ui/shadcn/input'
import { Label } from 'src/shared/ui/shadcn/label'

type TextFieldProps = ComponentProps<typeof Input> & {
  label?: string
  error?: boolean
  helperText?: string
}

export const TextField = (props: TextFieldProps) => {
  const { label, error, helperText, id, className, ...inputProps } = props
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helperClassName = error ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <Input
        id={inputId}
        aria-invalid={error || undefined}
        className={className}
        {...inputProps}
      />
      {helperText && <p className={helperClassName}>{helperText}</p>}
    </div>
  )
}
