import { classNames } from "@/shared/lib/classNames/classNames"
import { PropsWithChildren, useCallback, useState } from "react"
import styles from "./BoardItem.module.scss"

type BoardItemProps = {} & PropsWithChildren

export const BoardItem = (props: BoardItemProps) => {
  const { children } = props
  const [fullscreen, setFullscreen] = useState(false)

  const hundleFullScreen = useCallback(() => {
    setFullscreen((prev) => !prev)
  }, [])

  return (
    <div
      onDoubleClick={hundleFullScreen}
      className={classNames(styles.item, { [styles.fullscreen]: fullscreen })}
    >
      {children}
    </div>
  )
}
