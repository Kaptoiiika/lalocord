import { Button, Input } from "@mui/material"
import Typography from "@mui/material/Typography"
import { ChangeEvent, ReactNode, useState, useEffect } from "react"
import styles from "./InlineSelect.module.scss"
import { useTheme } from "@/shared/lib/hooks/useTheme/useTheme"

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
  const {
    title,
    list,
    value,
    onSelect,
    onCustomValueChange,
    allowCustomValue,
    customValue: propsCustomValue,
  } = props
  const { MuiTheme } = useTheme()
  const [selectedValue, setSelectedValue] = useState(value)
  const [customValue, setCustomValue] = useState<AllowType>()

  useEffect(() => {
    if (propsCustomValue) setCustomValue(propsCustomValue)
  }, [propsCustomValue])

  const handleSelect = (value: AllowType) => {
    setSelectedValue(value)
    onSelect?.(value)
  }

  const isCurrentValue = (item: AllowType) => {
    if (value) return item === value
    return item === selectedValue
  }

  const handleCustomValueChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onCustomValueChange?.(e.currentTarget.value)
    setCustomValue(e.currentTarget.value)
  }

  const handleSelectCustomValue = () => {
    if (customValue) {
      onCustomValueChange?.(customValue)
    }
  }

  const customValueIsActive = customValue ? isCurrentValue(customValue) : false

  return (
    <div className={styles.selector}>
      {title && <Typography>{title}</Typography>}
      <div className={styles.buttonlist}>
        {list.map((item, index) => (
          <Button
            key={index}
            variant={isCurrentValue(item) ? "contained" : undefined}
            onClick={() => handleSelect(item)}
          >
            {item}
          </Button>
        ))}

        {allowCustomValue && (
          <Input
            sx={{
              background: customValueIsActive
                ? MuiTheme?.palette.primary.main
                : undefined,
              color: customValueIsActive
                ? MuiTheme?.palette.primary.contrastText
                : undefined,
            }}
            className={styles.input}
            value={customValue}
            onChange={handleCustomValueChange}
            onClick={handleSelectCustomValue}
          />
        )}
      </div>
    </div>
  )
}
