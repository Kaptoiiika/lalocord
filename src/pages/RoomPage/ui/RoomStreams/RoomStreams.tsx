import { RTCClientMediaStream } from "@/entities/RTCClient/lib/RTCClient/RTCClientMediaStream"
import { useRoomRTCStore } from "@/entities/RTCClient/model/store/RoomRTCStore"
import { getLocalUser, useUserStore } from "@/entities/User"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { memo, useEffect, useState } from "react"
import { RTCClient } from "../../../../entities/RTCClient/lib/RTCClient/RTCClient"
import {
  getDisplayMediaStream,
  getRoomUsers,
  getWebCamStream,
} from "../../model/selectors/RoomRTCSelectors"
import { ClientStream } from "./ClientStream/ClientStream"
import { LocalClientStream } from "./ClientStream/LocalClientStream"
import styles from "./RoomStreams.module.scss"
import { startViewTransition } from "@/shared/lib/utils/ViewTransition/ViewTransition"

export const RoomStreams = memo(function RoomStreams() {
  const users = useRoomRTCStore(getRoomUsers)
  const localUser = useUserStore(getLocalUser)
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const [, update] = useState(0)

  useEffect(() => {
    const listeners = Object.values(users).map((user) => {
      const fn = async () => {
        await startViewTransition()
        update((prev) => prev + 1)
      }
      user.media.on("newstream", fn)
      return { user, fn }
    })

    return () => {
      listeners.forEach(({ user, fn }) => {
        user.media.off("newstream", fn)
      })
    }
  }, [users])

  //🤡
  const initialStreams: {
    client: RTCClient
    clientStream: RTCClientMediaStream
  }[] = []
  const streams = Object.values(users).reduce((prev, curent) => {
    curent.media.availableStreamList.forEach((stream) => {
      prev.push({ client: curent, clientStream: stream })
    })
    return prev
  }, initialStreams)

  const localStreams = []
  if (mediaStream)
    localStreams.push({ stream: mediaStream, name: localUser.username })
  if (webCamStream)
    localStreams.push({ stream: webCamStream, name: localUser.username })

  return (
    <StreamViewer className={styles.RoomStreams}>
      {localStreams.map((local) => (
        <LocalClientStream
          key={local.stream.id}
          stream={local.stream}
          name={local.name}
        />
      ))}

      {streams.map((user) => (
        <ClientStream
          key={user.clientStream.stream.id}
          client={user.client}
          clientStream={user.clientStream}
        />
      ))}
    </StreamViewer>
  )
})
