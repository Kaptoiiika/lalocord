import { PropsWithChildren } from "react"
import styles from "./PageWrapper.module.scss"

type PageWrapperProps = {
  className?: string
} & PropsWithChildren

export const PageWrapper = (props: PageWrapperProps) => {
  const { children } = props

  return <main className={styles.PageWrapper}>{children}</main>
}
