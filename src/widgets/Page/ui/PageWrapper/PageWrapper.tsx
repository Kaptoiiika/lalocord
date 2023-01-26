import { PropsWithChildren } from "react"
import styles from "./PageWrapper.module.scss"
import { Paper } from "@mui/material"

type PageWrapperProps = {
  className?: string
} & PropsWithChildren

export const PageWrapper = (props: PageWrapperProps) => {
  const { children } = props

  return (
    <main className={styles.PageWrapper}>
      <Paper className={styles.container} square>
        {children}
      </Paper>
    </main>
  )
}
