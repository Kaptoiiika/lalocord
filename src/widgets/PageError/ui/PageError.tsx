import { classNames } from "@/shared/lib/classNames/classNames"
import styles from "./PageError.module.scss"

type PageErrorProps = {
  className?: string
  title?: string
}

export const PageError = (props: PageErrorProps) => {
  const { className, title = "Some error))" } = props

  return (
    <div className={classNames(styles.PageError, className)}>{title}</div>
  )
}
