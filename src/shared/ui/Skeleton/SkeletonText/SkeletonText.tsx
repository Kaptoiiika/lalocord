import type { SkeletonProps } from '@mui/material'
import { Skeleton } from '@mui/material'
import { classNames } from 'src/shared/lib/classNames'

import styles from './SkeletonText.module.scss'

type SkeletonTextProps = Omit<SkeletonProps, 'variant'>

export function SkeletonText(props: SkeletonTextProps) {
  const { ...otherProps } = props

  return (
    <Skeleton
      {...otherProps}
      variant="text"
      className={classNames(otherProps.className, styles.root)}
    />
  )
}
