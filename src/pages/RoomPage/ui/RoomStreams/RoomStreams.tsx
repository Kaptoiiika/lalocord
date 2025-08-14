import {
  RTCClient,
  useRoomRTCStore,
  RTCClientMediaStream,
} from "@/entities/RTCClient"
import { getLocalUser, useUserStore } from "@/entities/User"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { memo, useEffect, useState } from "react"
import {
  getDisplayMediaStream,
  getRoomUsers,
  getWebCamStream,
} from "../../../../entities/RTCClient/model/selectors/RoomRTCSelectors"
import styles from "./RoomStreams.module.scss"
import { startViewTransition } from "@/shared/lib/utils/ViewTransition/ViewTransition"
import { RoomStream } from "./RoomStream/RoomStream"
import { classNames } from "@/shared/lib/classNames/classNames"
import { useAudioEffectStore } from "@/entities/AudioEffect"

export const RoomStreams = memo(function RoomStreams() {
  const users = useRoomRTCStore(getRoomUsers)
  const localUser = useUserStore(getLocalUser)
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const streamVolumeList = useAudioEffectStore(
    (state) => state.usersAuidoSettings
  )
  const changeVolumeHandle = useAudioEffectStore(
    (state) => state.changeUserVolume
  )
  const [hiddenStream, setHiddenStream] = useState<string[]>([])
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

  useEffect(() => {
    if (!mediaStream) return
    setHiddenStream((prev) => [...prev, mediaStream.id])

    return () => {
      setHiddenStream((prev) => prev.filter((id) => id !== mediaStream.id))
    }
  }, [mediaStream])

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
    localStreams.push({
      stream: mediaStream,
      name: localUser.username,
      autoplay: false,
    })
  if (webCamStream)
    localStreams.push({
      stream: webCamStream,
      name: localUser.username,
      autoplay: true,
    })

  const someStreamIsHide = hiddenStream.length

  return (
    <StreamViewer
      className={classNames(styles.RoomStreams, {
        [styles.RoomStreamsWithHiddenStream]: !!someStreamIsHide,
      })}
    >
      {localStreams.map((local) => (
        <RoomStream
          key={local.stream.id}
          stream={local.stream}
          title={local.name}
          autoplay={local.autoplay}
          mute
          volume={0}
          hide={!!hiddenStream.find((id) => id === local.stream.id)}
          onHide={() => {
            setHiddenStream((prev) => [...prev, local.stream.id])
          }}
          onUnHide={() => {
            setHiddenStream((prev) =>
              prev.filter((id) => id !== local.stream.id)
            )
          }}
        />
      ))}

      {streams.map((user) => (
        <RoomStream
          key={user.clientStream.stream.id}
          stream={user.clientStream.stream}
          title={user.client?.user?.username ?? user.client?.user?.id}
          hide={!!hiddenStream.find((id) => id === user.clientStream.stream.id)}
          onHide={() => {
            setHiddenStream((prev) => [...prev, user.clientStream.stream.id])
          }}
          onUnHide={() => {
            setHiddenStream((prev) =>
              prev.filter((id) => id !== user.clientStream.stream.id)
            )
          }}
          onPlay={() => {
            user.client.channel.sendData("resumeStream", user.clientStream.type)
          }}
          onPause={() => {
            user.client.channel.sendData("pauseStream", user.clientStream.type)
          }}
          onVolumeChange={(value) => {
            user.clientStream.volume = value
            changeVolumeHandle(
              user.client.user.username,
              user.clientStream.type,
              value
            )
          }}
          volume={
            streamVolumeList[user.client.user.username]?.[
              user.clientStream.type
            ] ?? user.clientStream.volume
          }
          autoplay
        />
      ))}
    </StreamViewer>
  )
})
