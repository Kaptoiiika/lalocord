import { getLocalUser, UserModel, useUserStore } from "@/entities/User"
import { StreamVideoPlayer } from "@/widgets/StreamVideoPlayer"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { memo, useEffect, useState } from "react"
import {
  getDisplayMediaStream,
  getRoomUsers,
  getWebCamStream,
} from "../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import styles from "./RoomStreams.module.scss"

type UserStream = { user: UserModel; stream: MediaStream }

export const RoomStreams = memo(function RoomStreams() {
  const users = useRoomRTCStore(getRoomUsers)
  const localUser = useUserStore(getLocalUser)
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const [, update] = useState(0)

  useEffect(() => {
    const listeners = Object.values(users).map((user) => {
      const fn = () => {
        update((prev) => prev + 1)
      }
      user.on("updateStreams", fn)
      return { user, fn }
    })

    return () => {
      listeners.forEach(({ user, fn }) => {
        user.off("updateStreams", fn)
      })
    }
  }, [users])

  const initialStreams: UserStream[] = []
  if (mediaStream) initialStreams.push({ stream: mediaStream, user: localUser })
  if (webCamStream)
    initialStreams.push({ stream: webCamStream, user: localUser })
  const streams = Object.values(users).reduce((prev, curent) => {
    if (curent.video.media)
      prev.push({ user: curent.user, stream: curent.video.media })
    if (curent.video.webCam)
      prev.push({ user: curent.user, stream: curent.video.webCam })
    return prev
  }, initialStreams)

  return (
    <StreamViewer className={styles.RoomStreams}>
      {streams.map((userStream) => (
        <div key={userStream.stream.id} className={styles.stream}>
          <StreamVideoPlayer
            stream={userStream.stream}
            user={userStream.user}
          />
        </div>
      ))}
    </StreamViewer>
  )
})
