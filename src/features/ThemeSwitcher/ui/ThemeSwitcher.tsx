import { memo } from 'react'

import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { IconButton } from '@mui/material'
import { useTheme } from 'src/shared/lib/hooks/useTheme/useTheme'

export const ThemeSwitcher = memo(function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="change theme"
    >
      {theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  )
})
