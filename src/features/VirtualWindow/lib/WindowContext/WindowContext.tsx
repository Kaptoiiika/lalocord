import { createContext } from "react"

export enum Theme {
  LIGHT = "light_theme",
  DARK = "dark_theme",
}

export interface WindowContextProps {
  lastUsedIndex: number
  getNextIndex: () => number
}

export const WindowContext = createContext<WindowContextProps>({
  lastUsedIndex: 0,
  getNextIndex: () => NaN,
})
