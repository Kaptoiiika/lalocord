import { PropsWithChildren } from "react"
import { GlobalContextMenu } from "./GlobalContextMenu"

export const ContextMenuProvider = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <>
      {children}
      <GlobalContextMenu />
    </>
  )
}
