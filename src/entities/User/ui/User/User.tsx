import { memo } from "react"
import { classNames } from "@/shared/lib/classNames/classNames"
import styles from "./User.module.scss"

type UserProps = {
  className?: string
}

export const User = memo((props: UserProps) => {
  const { className } = props

  return <div className={classNames([styles.User, className])}>
      
  </div>
})
