import { useContext } from "react"
// eslint-disable-next-line boundaries/element-types
import {
  Theme,
  ThemeContext,
} from "@/app/providers/ThemeProvider/lib/ThemeContext"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"

interface UseThemeResult {
  toggleTheme: () => void
  theme: keyof typeof Theme
}

export function useTheme(): UseThemeResult {
  const { theme, setTheme } = useContext(ThemeContext)

  const toggleTheme = () => {
    const newTheme = theme === Theme.dark ? Theme.light : Theme.dark
    setTheme(newTheme)
    localStorage.setItem(localstorageKeys.THEME, newTheme)
  }

  return {
    theme,
    toggleTheme,
  }
}
