import { PropsWithChildren } from "react"
import styles from "./VirtualWindowContainer.module.scss"

type VirtualWindowContainerProps = {} & PropsWithChildren

export const VirtualWindowContainer = (props: VirtualWindowContainerProps) => {
  const { children } = props

  return <div className={styles.VirtualWindowContainer}>{children}</div>
}
