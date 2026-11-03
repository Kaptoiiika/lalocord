import { useId } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { Label } from 'src/shared/ui/shadcn/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/shared/ui/shadcn/select'

export type SelectFieldOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  label?: string
  options: SelectFieldOption[]
  value?: string
  onValueChange?: (value: string) => void
  error?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const SelectField = (props: SelectFieldProps) => {
  const { label, options, value, onValueChange, error, disabled, placeholder, className } = props
  const generatedId = useId()
  const hasSelectedOption = options.some((option) => option.value === value)
  const selectValue = hasSelectedOption ? value : ''

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && <Label htmlFor={generatedId}>{label}</Label>}
      <Select
        value={selectValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={generatedId}
          className="w-full"
          aria-invalid={error || undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
