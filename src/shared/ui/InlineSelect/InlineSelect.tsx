import type { ReactNode } from 'react'
import { useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from 'src/shared/ui/shadcn/toggle-group'

type InlineSelectProps<T extends string> = {
  list: T[]
  value?: T
  itemTitle?: (item: T) => string
  title?: ReactNode
  onSelect?: (newValue: T) => void
}

export const InlineSelect = <T extends string>(props: InlineSelectProps<T>) => {
  const { title, list, value, onSelect, itemTitle } = props
  const [selectedValue, setSelectedValue] = useState(value)

  const handleSelect = (nextValue: T) => {
    setSelectedValue(nextValue)
    onSelect?.(nextValue)
  }

  const currentValue = value || selectedValue

  return (
    <div className="flex flex-col gap-1">
      {title && <p className="text-sm">{title}</p>}
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        className="w-full"
        value={currentValue}
        onValueChange={(nextValue) => {
          if (!nextValue) return
          handleSelect(nextValue as T)
        }}
      >
        {list.map((item) => (
          <ToggleGroupItem
            key={item}
            value={item}
            className="flex-1"
          >
            {itemTitle ? itemTitle(item) : item}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
