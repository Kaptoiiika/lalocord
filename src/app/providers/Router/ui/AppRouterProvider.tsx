import { PropsWithChildren } from "react"
import { BrowserRouter, HashRouter } from "react-router-dom"

type RoterProviderProps = {} & PropsWithChildren

export const AppRouterProvider = (props: RoterProviderProps) => {
  const { children } = props

  if (__IS_ELECTRON__) {
    return <HashRouter>{children}</HashRouter>
  }

  return <BrowserRouter>{children}</BrowserRouter>
}
