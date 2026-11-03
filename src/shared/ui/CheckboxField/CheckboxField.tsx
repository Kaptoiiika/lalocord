import type { ReactNode } from 'react'
import { useId } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Checkbox } from 'src/shared/ui/shadcn/checkbox'
import { Label } from 'src/shared/ui/shadcn/label'

type CheckboxFieldProps = {
  label?: ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  name?: string
  disabled?: boolean
  className?: string
  id?: string
}

export const CheckboxField = (props: CheckboxFieldProps) => {
  const { label, checked, onCheckedChange, name, disabled, className, id } = props
  const generatedId = useId()
  const inputId = id ?? generatedId

  const handleCheckedChange = (value: boolean | 'indeterminate') => {
    onCheckedChange?.(value === true)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox
        id={inputId}
        name={name}
        checked={checked}
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
      />
      {label && <Label htmlFor={inputId}>{label}</Label>}
    </div>
  )
}
