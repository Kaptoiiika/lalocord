import { classNames } from "@/shared/lib/classNames/classNames"

type UserProps = {
  className?: string
}

export const User = (props: UserProps) => {
  const { className } = props
  return <div className={classNames(["", className])}></div>
}
