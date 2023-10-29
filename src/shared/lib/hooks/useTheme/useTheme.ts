import { useContext } from "react"
// eslint-disable-next-line boundaries/element-types
import {
  ThemeContext,
  ThemeName,
} from "@/app/providers/ThemeProvider/lib/ThemeContext"
import { localstorageKeys } from "@/shared/const/localstorageKeys"
import { Theme } from "@mui/material"

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
