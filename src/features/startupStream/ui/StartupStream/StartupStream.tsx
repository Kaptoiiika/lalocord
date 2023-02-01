import { memo } from "react"
import { classNames } from "@/shared/lib/classNames/classNames"
import styles from "./StartupStream.module.scss"

type StartupStreamProps = {
  className?: string
}

export const StartupStream = memo((props: StartupStreamProps) => {
  const { className } = props

  return <div className={classNames([styles.StartupStream, className])}>
      
  </div>
})
