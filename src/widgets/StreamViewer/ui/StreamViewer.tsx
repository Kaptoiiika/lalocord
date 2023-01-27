import { ReactNode } from "react"
import { BoardItem } from "./BoardItem/BoardItem"
import styles from "./StreamViewer.module.scss"

type StreamViewerProps = {
  children?: ReactNode[] | ReactNode
}

export const StreamViewer = (props: StreamViewerProps) => {
  const { children } = props

  if (!Array.isArray(children)) {
    return (
      <div className={styles["StreamViewer"]}>
        <div className={styles.row}>{children}</div>
      </div>
    )
  }

  const totalRows = Math.round(Math.sqrt(children.length))
  const totalColumns = Math.ceil(children.length / totalRows)

  // let area = ""
  // let startedIndex = 0
  // for (let colum = 0; colum < totalColumns; colum++) {
  //   area = area + '"'
  //   for (let row = 0; row < totalRows; row++) {
  //     if (row === 0) area = area + `s${startedIndex}`
  //     else area = area + ` s${startedIndex}`
  //     startedIndex++
  //   }
  //   area = area + '"'
  // }

  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${totalColumns},1fr)`,
        gridTemplateRows: `repeat(${totalRows},1fr)`,
      }}
      className={styles["StreamViewer"]}
    >
      {children.map((elem, index) => (
        <BoardItem key={index}>{elem}</BoardItem>
      ))}
    </div>
  )
}
