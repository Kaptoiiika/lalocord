import type { PropsWithChildren } from 'react'
import { Children } from 'react'

import { classNames } from 'src/shared/lib/classNames'
import { sliceIntoTotalChunks } from 'src/shared/lib/utils/Arrays'

import styles from './StreamViewer.module.scss'

type StreamViewerProps = {
  className?: string
} & PropsWithChildren

export const StreamViewer = (props: StreamViewerProps) => {
  const { children, className } = props
  const childrenArr = Children.toArray(children)

  const totalRows = Math.round(Math.sqrt(childrenArr.length))
  const rows = sliceIntoTotalChunks(childrenArr, totalRows)

  return (
    <div className={classNames(styles.StreamViewer, className)}>
      {rows.map((rowChildren, index) => (
        <div
          key={`${index}`}
          className={styles.row}
        >
          {rowChildren}
        </div>
      ))}
    </div>
  )
}
