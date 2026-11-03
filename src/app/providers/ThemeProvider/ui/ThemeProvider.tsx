import type { PropsWithChildren } from 'react'
import { useMemo, useState } from 'react'

import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'

import { ThemeName, ThemeContext } from '../lib/ThemeContext'

const bodyClassByTheme: Record<ThemeName, string> = {
  [ThemeName.light]: ThemeName.light,
  [ThemeName.dark]: ThemeName.dark,
  [ThemeName.pink]: ThemeName.pink,
  [ThemeName.purple]: `${ThemeName.dark} ${ThemeName.purple}`,
  [ThemeName.leopard]: ThemeName.leopard,
}

const applyBodyTheme = (nextTheme: ThemeName) => {
  const container = document.body

  container.className = bodyClassByTheme[nextTheme]

  const color = getComputedStyle(container).getPropertyValue('--bg-app').trim()

  if (!color) return

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((metaTheme) => {
    metaTheme.content = color
  })
}

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
    applyBodyTheme(theme)
  })

  const defaultProps = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme: ThemeName) => {
        applyBodyTheme(nextTheme)
        setTheme(nextTheme)
      },
    }),
    [theme]
  )

  return <ThemeContext.Provider value={defaultProps}>{children}</ThemeContext.Provider>
}
