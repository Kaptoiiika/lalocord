import type { ChangeEvent, ReactNode } from 'react'
import { useState } from 'react'

import { cn } from 'src/shared/lib/utils/cn'
import { toggleVariants } from 'src/shared/ui/shadcn/toggle'
import { ToggleGroup, ToggleGroupItem } from 'src/shared/ui/shadcn/toggle-group'

type AllowType = string

type InlineSelectProps = {
  list: AllowType[]
  value?: AllowType
  title?: ReactNode
  allowCustomValue?: boolean
  customValue?: AllowType
  onSelect?: (newValue: AllowType) => void
  onCustomValueChange?: (newValue: AllowType) => void
}

export const InlineSelectPrimitive = (props: InlineSelectProps) => {
  const { title, list, value, onSelect, onCustomValueChange, allowCustomValue, customValue: propsCustomValue } = props
  const [selectedValue, setSelectedValue] = useState(value)
  const [customValue, setCustomValue] = useState<AllowType | undefined>(propsCustomValue)
  const [syncedCustomValue, setSyncedCustomValue] = useState(propsCustomValue)

  if (propsCustomValue !== syncedCustomValue) {
    setSyncedCustomValue(propsCustomValue)
    if (propsCustomValue) setCustomValue(propsCustomValue)
  }

  const handleSelect = (nextValue: AllowType) => {
    setSelectedValue(nextValue)
    onSelect?.(nextValue)
  }

  const isCurrentValue = (item: AllowType) => {
    if (value) return item === value

    return item === selectedValue
  }

  const handleCustomValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCustomValueChange?.(event.currentTarget.value)
    setCustomValue(event.currentTarget.value)
  }

  const handleSelectCustomValue = () => {
    if (customValue) {
      onCustomValueChange?.(customValue)
    }
  }

  const customValueIsActive = customValue ? isCurrentValue(customValue) : false
  const currentValue = value || selectedValue

  return (
    <div className="flex w-full flex-col gap-1">
      {title && <p className="text-sm">{title}</p>}
      <div className="flex w-full">
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          className="w-full"
          value={currentValue}
          onValueChange={(nextValue) => {
            if (!nextValue) return
            handleSelect(nextValue)
          }}
        >
          {list.map((item) => (
            <ToggleGroupItem
              key={item}
              value={item}
              className="flex-1"
            >
              {item}
            </ToggleGroupItem>
          ))}
          {allowCustomValue && (
            <input
              className={cn(
                toggleVariants({ variant: 'outline', size: 'default' }),
                'w-16 shrink-0 text-center',
                'group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-[spacing=0]/toggle-group:shadow-none',
                'focus:z-10 focus-visible:z-10',
                'group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md',
                'group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md',
                'data-[state=on]:bg-muted',
                'group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0',
                'group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l'
              )}
              data-state={customValueIsActive ? 'on' : 'off'}
              value={customValue ?? ''}
              onChange={handleCustomValueChange}
              onClick={handleSelectCustomValue}
            />
          )}
        </ToggleGroup>
      </div>
    </div>
  )
}
