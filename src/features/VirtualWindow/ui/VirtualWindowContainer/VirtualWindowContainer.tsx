import { memo, PropsWithChildren, useMemo, useState } from "react"
import { WindowContext } from "../../lib/WindowContext/WindowContext"
import styles from "./VirtualWindowContainer.module.scss"

type VirtualWindowContainerProps = {} & PropsWithChildren

export const VirtualWindowContainer = memo(
  (props: VirtualWindowContainerProps) => {
    const { children } = props
    const [lastIndex, setIastIndex] = useState(0)

    const incrementIndex = () => {
      setIastIndex((prev) => prev + 1)
      return lastIndex
    }

    return (
      <WindowContext.Provider
        value={{ getNextIndex: incrementIndex, lastUsedIndex: lastIndex }}
      >
        <div className={styles.VirtualWindowContainer}>{children}</div>
      </WindowContext.Provider>
    )
  }
)
