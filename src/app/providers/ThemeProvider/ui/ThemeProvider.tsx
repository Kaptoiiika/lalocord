import { createTheme, ThemeProvider as ThemeProviderMUI } from "@mui/material"
import { PropsWithChildren } from "react"

const Theme = createTheme({})

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return <ThemeProviderMUI theme={Theme}>{children}</ThemeProviderMUI>
}
