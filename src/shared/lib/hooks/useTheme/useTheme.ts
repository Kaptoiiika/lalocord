import { useContext } from 'react'

import type { Theme } from '@mui/material'
import { ThemeContext, ThemeName } from 'src/app/providers/ThemeProvider/lib/ThemeContext'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'

interface UseThemeResult {
  toggleTheme: () => void
  theme: keyof typeof ThemeName
  MuiTheme: Theme | null
}

export function useTheme(): UseThemeResult {
  const { theme, setTheme, MuiTheme } = useContext(ThemeContext)

  const toggleTheme = () => {
    const newTheme = theme === ThemeName.dark ? ThemeName.light : ThemeName.dark

    setTheme(newTheme)
    localStorage.setItem(localstorageKeys.THEME, newTheme)
  }

  return {
    theme,
    toggleTheme,
    MuiTheme,
  }
}
