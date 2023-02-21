import { Typography } from "@mui/material"
import { RTCClient } from "../../../lib/RTCClient/RTCClient"
import styles from "./RoomUserStream.module.scss"

type RoomUserStreamProps = {
  user: Pick<RTCClient, "id" | "video">
}

export const RoomUserStream = (props: RoomUserStreamProps) => {
  const { user } = props

  return (
    <div
      key={user.id}
      className={styles.stream}
      onDoubleClick={(e) => {
        e.currentTarget.requestFullscreen().catch((e) => {
          console.error(e)
        })
      }}
    >
      {/* <div className={styles.wrapper}>
        <Typography>{user.id}</Typography>
      </div> */}

      {!!user.video.webCam && (
        <video
          className={styles.video}
          ref={(node) => {
            if (node && node.srcObject !== user.video.webCam) {
              node.srcObject = user.video.webCam
            }
          }}
          autoPlay
          controls
          muted
          playsInline
        />
      )}
      {!!user.video.media && (
        <video
          className={styles.video}
          ref={(node) => {
            if (node && node.srcObject !== user.video.media) {
              node.srcObject = user.video.media
            }
          }}
          autoPlay
          controls
          muted
          playsInline
        />
      )}
    </div>
  )
}
