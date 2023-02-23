import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { RTCClient } from "../../../lib/RTCClient/RTCClient"
import styles from "./RoomUserStream.module.scss"

type RoomUserStreamProps = {
  user: Pick<RTCClient, "id" | "video">
}

export const RoomUserStream = (props: RoomUserStreamProps) => {
  const { user } = props

  return (
    <div key={user.id} className={styles.stream}>
      {!!user.video.webCam && <VideoPlayer stream={user.video.webCam} />}
      {!!user.video.media && <VideoPlayer stream={user.video.media} />}
    </div>
  )
}
