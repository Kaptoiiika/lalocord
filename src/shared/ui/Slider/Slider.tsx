import { cn } from 'src/shared/lib/utils/cn'
import { Slider as ShadcnSlider } from 'src/shared/ui/shadcn/slider'

type SliderProps = {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  onValueCommit?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

const readFirstValue = (values: number[]) => values[0]

export const Slider = (props: SliderProps) => {
  const { value, defaultValue, onValueChange, onValueCommit, min, max, step, disabled, className, ...aria } = props

  const handleValueChange = (values: number[]) => {
    const nextValue = readFirstValue(values)
    if (nextValue === undefined) return
    onValueChange?.(nextValue)
  }

  const handleValueCommit = (values: number[]) => {
    const nextValue = readFirstValue(values)
    if (nextValue === undefined) return
    onValueCommit?.(nextValue)
  }

  return (
    <ShadcnSlider
      value={value === undefined ? undefined : [value]}
      defaultValue={defaultValue === undefined ? undefined : [defaultValue]}
      onValueChange={onValueChange ? handleValueChange : undefined}
      onValueCommit={onValueCommit ? handleValueCommit : undefined}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={cn(className)}
      aria-label={aria['aria-label']}
    />
  )
}
