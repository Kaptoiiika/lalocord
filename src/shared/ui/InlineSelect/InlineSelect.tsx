import type { ReactNode } from 'react'
import { useState } from 'react'

import { Button, Typography } from '@mui/material'

import styles from './InlineSelect.module.scss'

type InlineSelectProps<T> = {
  list: T[]
  value?: T
  itemTitle?: (item: T) => string
  title?: ReactNode
  onSelect?: (newValue: T) => void
}

export const InlineSelect = <T,>(props: InlineSelectProps<T>) => {
  const { title, list, value, onSelect, itemTitle } = props
  const [selectedValue, setSelectedValue] = useState(value)
  const handleSelect = (value: T) => {
    setSelectedValue(value)
    onSelect?.(value)
  }

  const isCurrentValue = (item: T) => {
    if (value) return item === value

    return item === selectedValue
  }

  return (
    <div className={styles.selector}>
      {title && <Typography>{title}</Typography>}
      <div className={styles.buttonlist}>
        {list.map((item, index) => (
          <Button
            key={index}
            variant={isCurrentValue(item) ? 'contained' : undefined}
            onClick={() => handleSelect(item)}
          >
            {itemTitle ? itemTitle(item) : String(item)}
          </Button>
        ))}
      </div>
    </div>
  )
}

