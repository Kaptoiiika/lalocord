import { createContext } from 'react'

export enum ThemeName {
  light = 'light',
  dark = 'dark',
  pink = 'pink',
  purple = 'purple',
  leopard = 'leopard',
}

export interface ThemeContextProps {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: ThemeName.dark,
  setTheme: () => undefined,
})
