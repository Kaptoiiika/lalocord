import { Theme } from "@mui/material"
import { createContext } from "react"

export enum ThemeName {
  light = "light",
  dark = "dark",
}

export interface ThemeContextProps {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  MuiTheme: Theme | null
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: ThemeName.dark,
  setTheme: () => {},
  MuiTheme: null,
})
