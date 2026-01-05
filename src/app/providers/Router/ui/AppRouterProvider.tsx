import type { PropsWithChildren } from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'

import { __IS_ELECTRON__, BASE_URL } from 'src/shared/const/config'

type RoterProviderProps = PropsWithChildren

export const AppRouterProvider = (props: RoterProviderProps) => {
  const { children } = props

  if (__IS_ELECTRON__) {
    return <HashRouter>{children}</HashRouter>
  }

  return <BrowserRouter basename={BASE_URL}>{children}</BrowserRouter>
}
