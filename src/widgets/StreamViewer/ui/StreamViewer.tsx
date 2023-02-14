import { classNames } from "@/shared/lib/classNames/classNames"
import { sliceIntoTotalChunks } from "@/shared/lib/utils/Arrays"
import { ReactNode } from "react"
import styles from "./StreamViewer.module.scss"

type StreamViewerProps = {
  children?: ReactNode[] | ReactNode
  className?: string
}

export const StreamViewer = (props: StreamViewerProps) => {
  const { children, className } = props

  if (!Array.isArray(children)) {
    return (
      <div className={classNames([styles["StreamViewer"], className])}>
        <div className={styles.row}>{children}</div>
      </div>
    )
  }

  const totalRows = Math.round(Math.sqrt(children.length))

  const rows = sliceIntoTotalChunks(children, totalRows)

  return (
    <div className={classNames([styles["StreamViewer"], className])}>
      {rows.map((rowChildren, index) => (
        <div
          key={`${totalRows}-${index}-${rowChildren.length}`}
          className={styles.row}
        >
          {rowChildren}
        </div>
      ))}
    </div>
  )
}
