import { Button } from "@mui/material"
import ButtonGroup from "@mui/material/ButtonGroup/ButtonGroup"
import Typography from "@mui/material/Typography"
import { ReactNode, useState } from "react"
import styles from "./InlineSelect.module.scss"

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
      <ButtonGroup fullWidth>
        {list.map((item, index) => (
          <Button
            key={index}
            variant={isCurrentValue(item) ? "contained" : undefined}
            onClick={() => handleSelect(item)}
          >
            {itemTitle ? itemTitle(item) : String(item)}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}
