import { useContext } from 'react'

import { ThemeContext, ThemeName } from 'src/app/providers/ThemeProvider/lib/ThemeContext'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'

interface UseThemeResult {
  toggleTheme: () => void
  theme: keyof typeof ThemeName
}

const nextThemeByCurrent: Record<ThemeName, ThemeName> = {
  [ThemeName.light]: ThemeName.dark,
  [ThemeName.dark]: ThemeName.pink,
  [ThemeName.pink]: ThemeName.purple,
  [ThemeName.purple]: ThemeName.light,
}

export function useTheme(): UseThemeResult {
  const { theme, setTheme } = useContext(ThemeContext)

  const toggleTheme = () => {
    const newTheme = nextThemeByCurrent[theme]

    setTheme(newTheme)
    localStorage.setItem(localstorageKeys.THEME, newTheme)
  }

  return {
    theme,
    toggleTheme,
  }
}
