import type { ReactNode } from 'react'
import { useId } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Label } from 'src/shared/ui/shadcn/label'
import { Switch } from 'src/shared/ui/shadcn/switch'

type SwitchFieldProps = {
  label?: ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  name?: string
  disabled?: boolean
  className?: string
  id?: string
}

export const SwitchField = (props: SwitchFieldProps) => {
  const { label, checked, onCheckedChange, name, disabled, className, id } = props
  const generatedId = useId()
  const inputId = id ?? generatedId

  const handleCheckedChange = (value: boolean) => {
    onCheckedChange?.(value)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Switch
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
