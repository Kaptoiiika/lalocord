import { memo, useState } from 'react'

import { useAudioEffectStore } from 'src/entities/AudioEffect'
import { getLocalUser, useLocalUserStore } from 'src/entities/User'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'
import { classNames } from 'src/shared/lib/classNames/classNames'
import { useThrottle } from 'src/shared/lib/hooks/useThrottle/useThrottle'
import { StreamViewer } from 'src/widgets/StreamViewer/ui/StreamViewer'

import type { UserModel } from 'src/entities/User'
import type { StreamType} from 'src/entities/WebRTC';

import { RoomStream } from './RoomStream/RoomStream'

import styles from './RoomStreams.module.scss'

type UserWithStream = {
  user: UserModel
  stream: MediaStream
  type: StreamType
}

export const RoomStreams = memo(function RoomStreams() {
  const { users } = useWebRTCRoomStore()
  const localUser = useLocalUserStore(getLocalUser)
  const screenStream = useWebRTCStore((state) => state.streams.screen)
  const webCamStream = useWebRTCStore((state) => state.streams.webCam)
  const streamVolumeList = useAudioEffectStore((state) => state.usersAuidoSettings)
  const changeVolumeHandle = useAudioEffectStore((state) => state.changeUserVolume)
  const [hiddenStream, setHiddenStream] = useState<Set<string>>(new Set())

  const changeUserStreamVolume = useThrottle((userWithStream: UserWithStream, volume: number) => {
    // userWithStream.stream.volume = volume
    changeVolumeHandle(userWithStream.user.username, userWithStream.type, volume)
  }, 500)

  // useEffect(() => {
  //   console.log("mediaStream")
  //   if (!screenStream) return
  //   setHiddenStream((prev) => {
  //     prev.add(screenStream.id)
  //     return new Set(prev)
  //   })

  //   return () => {
  //     setHiddenStream((prev) => {
  //       prev.delete(screenStream.id)
  //       return new Set(prev)
  //     })
  //   }
  // }, [screenStream])

  const streams = Object.values(users).reduce<UserWithStream[]>((prev, curent) => {
    Object.entries(curent.peer.remoteStreams).forEach(([type, stream]) => {
      if (!stream) return
      if (type === 'mic') return
      prev.push({
        user: curent.user,
        stream, 
        type: type as StreamType,
      })
    })

    return prev
  }, [])

  const localStreams = []

  if (screenStream)
    localStreams.push({
      stream: screenStream,
      name: localUser.username,
      autoplay: true,
    })
  if (webCamStream)
    localStreams.push({
      stream: webCamStream,
      name: localUser.username,
      autoplay: true,
    })

  const someStreamIsHide = hiddenStream.size
  const hiddenStreamIds = [...hiddenStream]

  return (
    <StreamViewer
      className={classNames(styles.RoomStreams, {
        [styles.RoomStreamsWithHiddenStream]: !!someStreamIsHide,
      })}
    >
      {localStreams.map(({ stream, name, autoplay }) => (
        <RoomStream
          key={stream.id}
          stream={stream}
          title={name}
          autoplay={autoplay}
          mute
          volume={0}
          hide={hiddenStream.has(stream.id)}
          hideId={hiddenStreamIds.findIndex((id) => id === stream.id)}
          onHide={() => {
            hiddenStream.add(stream.id)
            setHiddenStream(new Set(hiddenStream))
          }}
          onUnHide={() => {
            hiddenStream.delete(stream.id)
            setHiddenStream(new Set(hiddenStream))
          }}
        />
      ))}

      {streams.map(({ stream, user, type }) => (
        <RoomStream
          key={stream.id}
          stream={stream}
          title={user?.username ?? user?.id}
          hide={hiddenStream.has(stream.id)}
          hideId={hiddenStreamIds.findIndex((id) => id === stream.id)}
          onHide={() => {
            hiddenStream.add(stream.id)
            setHiddenStream(new Set(hiddenStream))
          }}
          onUnHide={() => {
            hiddenStream.delete(stream.id)
            setHiddenStream(new Set(hiddenStream))
          }}
          onPlay={() => {
            // user.client.channel.sendData('resumeStream', user.clientStream.type)
          }}
          onPause={() => {
            // user.client.channel.sendData('pauseStream', user.clientStream.type)
          }}
          onVolumeChange={(value) => {
            changeUserStreamVolume(user, value)
          }}
          volume={streamVolumeList[user.username]?.[type] ?? 0}
          autoplay
        />
      ))}
    </StreamViewer>
  )
})
