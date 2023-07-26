import { PropsWithChildren, useEffect } from "react"
import { changeDebugValue, getDebugValue } from "./useDebugMode"
type DebugModeProviderProps = {} & PropsWithChildren

export const DebugModeProvider = (props: DebugModeProviderProps) => {
  const { children } = props

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "F2") {
        const isDebug = getDebugValue()
        changeDebugValue(!isDebug)
      }
    }
    document.addEventListener("keydown", fn)
    return () => {
      document.removeEventListener("keydown", fn)
    }
  }, [])

  return <>{children}</>
}
