import { Paper } from "@mui/material"
import { PropsWithChildren, useContext } from "react"
import { useWindow } from "../../lib/useWindow/useWindow"
import styles from "./VirtualWindow.module.scss"
import { ResizeFrame } from "../ResizeFrame/ResizeFrame"
import { PartsType, WindowParams } from "../../model/types/WindowParams"
import { WindowContext } from "../../lib/WindowContext/WindowContext"

type VirtualWindowProps = {} & PropsWithChildren & Partial<WindowParams>

export const VirtualWindow = (props: VirtualWindowProps) => {
  const { children } = props

  const {
    onMouseDown,
    togleFullScreen,
    width,
    height,
    x,
    y,
    fullScreen,
    index,
  } = useWindow({
    width: props.width || 680,
    height: props.height || 480,
    x: props.x || 0,
    y: props.y || 0,
    fullScreen: props.fullScreen,
    index: props.index,
  })

  const style = fullScreen
    ? {
        left: 0,
        top: 0,
        width: `100%`,
        height: `100%`,
        zIndex: index,
      }
    : {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: index,
      }

  return (
    <div className={styles.container} style={style}>
      <Paper className={styles.content}>{children}</Paper>
      <ResizeFrame
        resizable={!fullScreen}
        onMouseDown={onMouseDown}
        onDoubleClick={togleFullScreen}
      />
    </div>
  )
}
