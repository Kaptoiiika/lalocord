import { memo } from 'react'

import { Grape, Heart, Moon, Sun } from 'lucide-react'
import { ThemeName } from 'src/app/providers/ThemeProvider/lib/ThemeContext'
import { useTheme } from 'src/shared/lib/hooks/useTheme/useTheme'
import { IconButton } from 'src/shared/ui'

const themeIcon: Record<ThemeName, typeof Sun> = {
  [ThemeName.light]: Sun,
  [ThemeName.dark]: Moon,
  [ThemeName.pink]: Heart,
  [ThemeName.purple]: Grape,
}

const nextThemeLabel: Record<ThemeName, string> = {
  [ThemeName.light]: 'Switch to dark theme',
  [ThemeName.dark]: 'Switch to pink theme',
  [ThemeName.pink]: 'Switch to purple theme',
  [ThemeName.purple]: 'Switch to light theme',
}

export const ThemeSwitcher = memo(function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
  const Icon = themeIcon[theme]

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label={nextThemeLabel[theme]}
    >
      <Icon />
    </IconButton>
  )
})
