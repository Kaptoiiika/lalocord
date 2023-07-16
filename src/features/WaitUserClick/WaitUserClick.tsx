import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import Typography from "@mui/material/Typography"
import { PropsWithChildren, useState } from "react"
import styles from "./WaitUserClick.module.scss"

type WaitUserClickProps = {} & PropsWithChildren

export const WaitUserClick = (props: WaitUserClickProps) => {
  const { children } = props

  const [, update] = useState(0)

  useMountedEffect(() => {
    const fn = (e: MouseEvent) => {
      //@ts-ignore not in firefox
      if (e.isTrusted || navigator.userActivation?.hasBeenActive === true) {
        update((prev) => prev + 1)
        document.removeEventListener("click", fn)
      }
    }
    const fnKey = (e: KeyboardEvent) => {
      //@ts-ignore not in firefox
      if (e.isTrusted || navigator.userActivation?.hasBeenActive === true) {
        update((prev) => prev + 1)
        document.removeEventListener("keypress", fnKey)
      }
    }

    document.addEventListener("click", fn)
    document.addEventListener("keypress", fnKey)

    return () => {
      document.removeEventListener("click", fn)
      document.removeEventListener("keypress", fnKey)
    }
  })

  //@ts-ignore not in firefox
  if (navigator.userActivation && !navigator.userActivation?.hasBeenActive) {
    return (
      <div className={styles.WaitUserClick}>
        <Typography variant="h4">Сlick anywhere to continue</Typography>
      </div>
    )
  }

  return <>{children}</>
}
