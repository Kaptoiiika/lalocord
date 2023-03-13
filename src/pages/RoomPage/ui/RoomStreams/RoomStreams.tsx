import { getLocalUser, useUserStore } from "@/entities/User"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import React, { memo, useEffect, useState } from "react"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import { RTCClientMediaStream } from "../../lib/RTCClient/RTCClientMediaStream"
import {
  getDisplayMediaStream,
  getRoomUsers,
  getWebCamStream,
} from "../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { ClientStream } from "./ClientStream/ClientStream"
import { LocalClientStream } from "./ClientStream/LocalClientStream"
import styles from "./RoomStreams.module.scss"

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
        <div key={local.stream.id} className={styles.stream}>
          <LocalClientStream stream={local.stream} name={local.name} />
        </div>
      ))}

      {streams.map((user) => (
        <div key={user.clientStream.stream.id} className={styles.stream}>
          <ClientStream client={user.client} clientStream={user.clientStream} />
        </div>
      ))}
    </StreamViewer>
  )
})
