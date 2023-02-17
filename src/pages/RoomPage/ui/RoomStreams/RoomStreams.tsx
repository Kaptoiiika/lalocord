import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { Typography } from "@mui/material"
import { memo, useEffect, useState } from "react"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import styles from "./RoomStreams.module.scss"

type RoomStreamsProps = {
  users: RTCClient[]
  localStream: MediaStream | null
}

export const RoomStreams = memo(function RoomStreams(props: RoomStreamsProps) {
  const { users, localStream } = props
  const [userStreams, setUserStreams] = useState(() =>
    users.filter((usr) => !!usr.video)
  )

  useEffect(() => {
    const listeners = users.map((user) => {
      const fn = (stream: MediaStream | null) => {
        if (stream) setUserStreams((prev) => [...prev, user])
        else setUserStreams((prev) => prev.filter((usr) => user.id !== usr.id))
      }
      user.on("streamVideo", fn)
      return { user, fn }
    })

    return () => {
      listeners.forEach(({ user, fn }) => {
        user.off("streamVideo", fn)
      })
    }
  }, [users])

  return (
    <StreamViewer>
      {!!localStream && (
        <div
          className={styles.stream}
          onDoubleClick={(e) => {
            e.currentTarget.requestFullscreen()
          }}
        >
          <div className={styles.wrapper}>
            <Typography>{"local"}</Typography>
          </div>
          <video
            style={{ width: "100%", height: "100%" }}
            ref={(node) => {
              if (node && node.srcObject !== localStream) {
                node.srcObject = localStream
              }
            }}
            autoPlay
            muted
            controls
            playsInline
          />
        </div>
      )}
      {userStreams.map((user) => (
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
            controls
            muted
            playsInline
          />
        </div>
      ))}
    </StreamViewer>
  )
})
