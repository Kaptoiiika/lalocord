import { classNames } from "@/shared/lib/classNames/classNames"
import { memo, VideoHTMLAttributes } from "react"
import styles from "./VideoPlayer.module.scss"

type VideoPlayerProps = {
  type?: "stream" | "video"
  stream?: MediaStream
} & VideoHTMLAttributes<HTMLVideoElement>

export const VideoPlayer = memo(function VideoPlayer(props: VideoPlayerProps) {
  const { stream = null, className, ...other } = props

  return (
    <div className={styles.video}>
      <video
        {...other}
        className={classNames([styles.video, className])}
        ref={(node) => {
          if (node && node.srcObject !== stream) {
            node.srcObject = stream
          }
        }}
        autoPlay
        controls
        playsInline
      />
    </div>
  )
})
