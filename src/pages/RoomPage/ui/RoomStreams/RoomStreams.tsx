import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { memo, useEffect, useState } from "react"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import {
  getDisplayMediaStream,
  getRoomUsers,
  getWebCamStream,
} from "../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import styles from "./RoomStreams.module.scss"

type RoomStreamsProps = {}

export const RoomStreams = memo(function RoomStreams(props: RoomStreamsProps) {
  const users = useRoomRTCStore(getRoomUsers)
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const [userStreams, setUserStreams] = useState<RTCClient[]>([])

  useEffect(() => {
    const userList = Object.values(users)
    setUserStreams(
      userList.filter((usr) => !!usr.video.media || !!usr.video.webCam)
    )

    const listeners = userList.map((user) => {
      const fn = () => {
        const haveAnyStream = !!user.video.media || !!user.video.webCam
        if (haveAnyStream)
          setUserStreams((prev) => {
            const includeInList = prev.find(
              (prevUser) => prevUser.id === user.id
            )
            return includeInList ? [...prev] : [...prev, user]
          })
        else {
          setUserStreams((prev) =>
            prev.filter((prevUser) => prevUser.id !== user.id)
          )
        }
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

  const streams: Pick<RTCClient, "id" | "video">[] = [...userStreams]
  if (mediaStream || webCamStream)
    streams.push({
      id: "local",
      video: { media: mediaStream, webCam: webCamStream },
    })

  return (
    <StreamViewer className={styles.RoomStreams}>
      {streams.map((user) => (
        <div key={user.id} className={styles.stream}>
          {!!user.video.webCam && <VideoPlayer stream={user.video.webCam} />}
          {!!user.video.media && <VideoPlayer stream={user.video.media} />}
        </div>
      ))}
    </StreamViewer>
  )
})
