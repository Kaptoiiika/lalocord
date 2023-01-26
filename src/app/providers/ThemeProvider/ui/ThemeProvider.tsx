import { PropsWithChildren, useMemo, useState } from "react"
import {
  LOCAL_STORAGE_THEME_KEY,
  Theme,
  ThemeContext,
} from "../lib/ThemeContext"

const getDefaultTheme = (): Theme => {
  const defaultTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY)
  if (Object.values(Theme).includes(defaultTheme as Theme)) {
    return defaultTheme as Theme
  }
  return Theme.DARK
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(getDefaultTheme())
  const defaultProps = useMemo(
    () => ({
      theme: theme,
      setTheme: setTheme,
    }),
    [theme]
  )

  return (
    <ThemeContext.Provider value={defaultProps}>
      {children}
    </ThemeContext.Provider>
  )
}
