import { classNames } from "@/shared/lib/classNames/classNames"
import styles from "./PageError.module.scss"

type PageErrorProps = {
  className?: string
}

export const PageError = (props: PageErrorProps) => {
  const { className } = props

  return <div className={classNames([styles.PageError, className])}>{"Some error))"}</div>
}
