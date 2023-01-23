import { PropsWithChildren } from "react"
import { classNames } from "@/shared/lib/classNames/classNames"

import styles from "./PageWrapper.module.scss"

type PageWrapperProps = {
  className?: string
} & PropsWithChildren

export const PageWrapper = (props: PageWrapperProps) => {
  const { children, className } = props

  return (
    <main className={classNames([styles.scrollWrapper, className])}>
      <div className={styles.PageWrapper}>{children}</div>
    </main>
  )
}
