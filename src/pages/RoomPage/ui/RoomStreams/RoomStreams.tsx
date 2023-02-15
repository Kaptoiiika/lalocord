import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { Typography } from "@mui/material"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import styles from "./RoomStreams.module.scss"

type RoomStreamsProps = {
  users: Pick<RTCClient, "id" | "video">[]
  localStream: MediaStream | null
}

export const RoomStreams = (props: RoomStreamsProps) => {
  const { users, localStream } = props

  const streams = [{ id: "local", video: localStream }, ...users]

  return (
    <StreamViewer>
      {streams.map((user) => (
        <div
          key={user.id}
          className={styles.stream}
          onDoubleClick={(e) => {
            e.currentTarget.requestFullscreen()
          }}
        >
          <div className={styles.wrapper}>
            <Typography>{user.id}</Typography>
          </div>
          <video
            style={{ width: "100%", height: "100%" }}
            ref={(node) => {
              if (node && node.srcObject !== user.video) {
                node.srcObject = user.video
              }
            }}
            autoPlay
            muted
            playsInline
          />
        </div>
      ))}
    </StreamViewer>
  )
}
