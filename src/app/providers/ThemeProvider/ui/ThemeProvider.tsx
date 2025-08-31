import type { PropsWithChildren } from 'react'
import { useMemo, useState } from 'react'

import { createTheme, ThemeProvider as ThemeProviderMUI } from '@mui/material'
import { blue, pink } from '@mui/material/colors'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'

import { ThemeName, ThemeContext } from '../lib/ThemeContext'

const getDefaultTheme = (): ThemeName => {
  const defaultTheme = localStorage.getItem(localstorageKeys.THEME)

  if (Object.values(ThemeName).includes(defaultTheme as ThemeName)) {
    return defaultTheme as ThemeName
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return ThemeName.dark
  }

  return ThemeName.dark
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<ThemeName>(getDefaultTheme())

  useMountedEffect(() => {
    const container = document.body

    if (container) {
      container.className = theme
    }

    const currentColorModeisDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const metaTheme: HTMLMetaElement | null = currentColorModeisDark
      ? document.querySelector("meta[media='(prefers-color-scheme: dark)']")
      : document.querySelector("meta[media='(prefers-color-scheme: light)']")
    const color = getComputedStyle(container).getPropertyValue('--bg-app')

    if (metaTheme && color) {
      metaTheme.content = color
    }
  })

  const MuiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          background: {
            paper: 'var(--bg-app)',
          },
          text: {
            primary: 'rgb(var(--primary-color))',
          },
          primary: {
            main: theme === 'dark' ? pink[200] : blue[300],
          },
        },
      }),
    [theme]
  )

  const defaultProps = useMemo(
    () => ({
      theme,
      setTheme: (theme: ThemeName) => {
        const container = document.querySelector('body')

        if (container) {
          container.className = theme
          setTheme(theme)
        }
      },
      MuiTheme,
    }),
    [theme, MuiTheme]
  )

  return (
    <ThemeContext.Provider value={defaultProps}>
      <ThemeProviderMUI theme={MuiTheme}>{children}</ThemeProviderMUI>
    </ThemeContext.Provider>
  )
}
