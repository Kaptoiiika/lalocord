import { classNames } from "@/shared/lib/classNames/classNames"
import { PropsWithChildren, ElementType, ComponentProps } from "react"
import styles from "./PageWrapper.module.scss"

type PageWrapperBaseProps<E extends ElementType = ElementType> = {
  className?: string
  component?: E
}

type PageWrapperProps<E extends ElementType> = PageWrapperBaseProps &
  PropsWithChildren &
  Omit<ComponentProps<E>, keyof PageWrapperBaseProps>

const defaultElement = "main"

export const PageWrapper = <E extends ElementType = typeof defaultElement>(
  props: PageWrapperProps<E>
) => {
  const { children, className, component = "main", ...other } = props
  const Tag = component

  return (
    <Tag className={classNames(styles.PageWrapper, className)} {...other}>
      {children}
    </Tag>
  )
}
