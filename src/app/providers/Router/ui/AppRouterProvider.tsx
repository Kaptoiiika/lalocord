import { PropsWithChildren } from "react"
import { BrowserRouter, HashRouter } from "react-router-dom"
import styles from "./RoterProvider.module.scss"

type RoterProviderProps = {} & PropsWithChildren

export const AppRouterProvider  = (props: RoterProviderProps) => {
  const { children } = props

  if (false) { // __electron__
    return <HashRouter>{children}</HashRouter>
  }

  return <BrowserRouter>{children}</BrowserRouter>
}
