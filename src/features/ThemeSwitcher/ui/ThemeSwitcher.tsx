import { memo } from 'react'

import { Grape, Heart, Moon, PawPrint, Sun } from 'lucide-react'
import { ThemeName } from 'src/app/providers/ThemeProvider/lib/ThemeContext'
import { useTheme } from 'src/shared/lib/hooks/useTheme/useTheme'
import { startViewTransition } from 'src/shared/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger } from 'src/shared/ui/shadcn/select'

const themes: { value: ThemeName; label: string; Icon: typeof Sun }[] = [
  { value: ThemeName.light, label: 'Light', Icon: Sun },
  { value: ThemeName.dark, label: 'Dark', Icon: Moon },
  { value: ThemeName.pink, label: 'Pink', Icon: Heart },
  { value: ThemeName.purple, label: 'Purple', Icon: Grape },
  { value: ThemeName.leopard, label: 'Leopard', Icon: PawPrint },
]

const themeByName = Object.fromEntries(themes.map((item) => [item.value, item])) as Record<
  ThemeName,
  (typeof themes)[number]
>

export const ThemeSwitcher = memo(function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const CurrentIcon = themeByName[theme].Icon

  const handleChange = async (value: string) => {
    if (!(value in themeByName)) return

    await startViewTransition()
    setTheme(value as ThemeName)
  }

  return (
    <Select
      value={theme}
      onValueChange={handleChange}
    >
      <SelectTrigger
        aria-label={`Theme: ${themeByName[theme].label}`}
        className="size-10 justify-center border-0 bg-transparent shadow-none hover:bg-foreground/10 dark:bg-transparent dark:hover:bg-foreground/10 [&_svg:last-child]:hidden"
      >
        <CurrentIcon className="size-5" />
      </SelectTrigger>
      <SelectContent
        side="right"
        align="end"
        position="popper"
        collisionPadding={12}
      >
        {themes.map(({ value, label, Icon }) => (
          <SelectItem
            key={value}
            value={value}
          >
            <Icon />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})
