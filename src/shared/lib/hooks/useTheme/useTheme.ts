import { useContext } from 'react'

import { ThemeContext, type ThemeName } from 'src/app/providers/ThemeProvider/lib/ThemeContext'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'

interface UseThemeResult {
  setTheme: (theme: ThemeName) => void
  theme: ThemeName
}

export function useTheme(): UseThemeResult {
  const { theme, setTheme: setContextTheme } = useContext(ThemeContext)

  const setTheme = (nextTheme: ThemeName) => {
    setContextTheme(nextTheme)
    localStorage.setItem(localstorageKeys.THEME, nextTheme)
  }

  return {
    theme,
    setTheme,
  }
}
