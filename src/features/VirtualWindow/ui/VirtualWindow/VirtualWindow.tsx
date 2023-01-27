import { Paper } from "@mui/material"
import { PropsWithChildren } from "react"
import { useWindow } from "../../lib/useWindow/useWindow"
import styles from "./VirtualWindow.module.scss"
import { ResizeFrame } from "../ResizeFrame/ResizeFrame"
import { WindowParams } from "../../model/types/WindowParams"

type VirtualWindowProps = {} & PropsWithChildren & Partial<WindowParams>

export const VirtualWindow = (props: VirtualWindowProps) => {
  const { children } = props

  const { onMouseDown, togleFullScreen, width, height, x, y, fullScreen } =
    useWindow({
      width: props.width || 300,
      height: props.height || 300,
      x: props.x || 0,
      y: props.y || 0,
      fullScreen: props.fullScreen,
      index: props.index,
    })

  const style: React.CSSProperties = fullScreen
    ? {
        left: 0,
        top: 0,
        width: `100%`,
        height: `100%`,
        zIndex: 10,
        position: "absolute",
      }
    : {
        // left: `${x}px`,
        // top: `${y}px`,
        // width: `${width}px`,
        width: `min(100%, ${width}px)`,
        height: `${height}px`,
      }

  return (
    <div className={styles.container} style={style}>
      <Paper className={styles.content}>{children}</Paper>
      <ResizeFrame
        disabled={!fullScreen}
        onMouseDown={onMouseDown}
        onDoubleClick={togleFullScreen}
      />
    </div>
  )
}
