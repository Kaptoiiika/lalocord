import { localstorageKeys } from "@/shared/const/localstorageKeys"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { createTheme, ThemeProvider as ThemeProviderMUI } from "@mui/material"
import { blue, pink } from "@mui/material/colors"
import { PropsWithChildren, useMemo, useState } from "react"
import { Theme, ThemeContext } from "../lib/ThemeContext"

const getDefaultTheme = (): Theme => {
  const defaultTheme = localStorage.getItem(localstorageKeys.THEME)
  if (Object.values(Theme).includes(defaultTheme as Theme)) {
    return defaultTheme as Theme
  }
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return Theme.dark
  }
  return Theme.dark
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(getDefaultTheme())
  const defaultProps = useMemo(
    () => ({
      theme: theme,
      setTheme: (theme: Theme) => {
        const container = document.querySelector("body")
        if (container) {
          container.className = theme
          setTheme(theme)
        }
      },
    }),
    [theme]
  )

  useMountedEffect(() => {
    const container = document.body
    if (container) {
      container.className = theme
    }

    const currentColorModeisDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
    const metaTheme: HTMLMetaElement | null = currentColorModeisDark
      ? document.querySelector("meta[media='(prefers-color-scheme: dark)']")
      : document.querySelector("meta[media='(prefers-color-scheme: light)']")
    const color = getComputedStyle(container).getPropertyValue("--bg-app")

    if (metaTheme && color) {
      metaTheme.content = color
    }
  })

  const MuiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          text: {
            primary: "rgb(var(--primary-color))",
          },
          primary: {
            main: theme === "dark" ? pink[200] : blue[300],
          },
        },
      }),
    [theme]
  )

  useMountedEffect(() => {
    const cursor = localStorage.getItem(localstorageKeys.CURSOR)
    if (cursor) {
      console.log('apply cursor')
      const cursorStyle = 'url(https://cdn.discordapp.com/attachments/419197900254347264/1151983333643915304/Untitled-1.webp),default'
      document.body.style.cursor = cursorStyle
      document.head.insertAdjacentHTML("beforeend", `<style>a,button{cursor:${cursorStyle} !important}</style>`)
    }
  })

  return (
    <ThemeContext.Provider value={defaultProps}>
      <ThemeProviderMUI theme={MuiTheme}>{children}</ThemeProviderMUI>
    </ThemeContext.Provider>
  )
}
