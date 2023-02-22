import { downloadBlob } from "@/shared/lib/utils/downloadBlob/downloadBlob"
import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Typography } from "@mui/material"
import { RTCClient } from "../../../lib/RTCClient/RTCClient"
import styles from "./RoomUserStream.module.scss"

type RoomUserStreamProps = {
  user: Pick<RTCClient, "id" | "video">
}

export const RoomUserStream = (props: RoomUserStreamProps) => {
  const { user } = props

  const hundleStartRecordStream = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream)
    recorder.ondataavailable = (e) => {
      downloadBlob(e.data, `${stream.id}`)
    }
    recorder.start()
  }

  return (
    <div key={user.id} className={styles.stream}>
      {/* <div className={styles.wrapper}>
        <Typography>{user.id}</Typography>
      </div> */}

      {!!user.video.webCam && <VideoPlayer stream={user.video.webCam} />}
      {!!user.video.media && <VideoPlayer stream={user.video.media} />}
    </div>
  )
}
