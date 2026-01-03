import { memo, useEffect, useState } from 'react'

import { useAudioEffectStore } from 'src/entities/AudioEffect'
import { getLocalUser, useLocalUserStore } from 'src/entities/User'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { classNames } from 'src/shared/lib/classNames/classNames'
import { useThrottle } from 'src/shared/lib/hooks/useThrottle/useThrottle'
import { StreamViewer } from 'src/widgets/StreamViewer/ui/StreamViewer'
import { TicTacToeMultiplayer } from 'src/widgets/TicTacToe/ui/TicTacToe'

import type { StreamType } from 'src/entities/WebRTC'
import type { RoomUser } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import type { TicTacToeGame } from 'src/widgets/TicTacToe'

import { useRoomStreamStore } from '../../model/store/RoomStreamStore'
import { RoomStream } from '../RoomStream/RoomStream'

import styles from './RoomStreamList.module.scss'

type UserWithStream = {
  user: RoomUser
  stream: MediaStream
  type: StreamType
}

export const RoomStreams = memo(function RoomStreams() {
  const { users, miniGame } = useWebRTCRoomStore()
  const localUser = useLocalUserStore(getLocalUser)
  const screenStream = useWebRTCStore((state) => state.streams.screen)
  const webCamStream = useWebRTCStore((state) => state.streams.webCam)
  const streamVolumeList = useAudioEffectStore((state) => state.usersAuidoSettings)
  const changeVolumeHandle = useAudioEffectStore((state) => state.changeUserVolume)
  const hiddenStreams = useRoomStreamStore((state) => state.hiddenStreams)
  const [, update] = useState(0)

  const changeUserStreamVolume = useThrottle((user: RoomUser, volume: number) => {
    changeVolumeHandle(user.user.username, 'screen', volume)
  }, 500)

  useEffect(() => {
    const updateFn = () => {
      update((prev) => prev + 1)
    }

    users.forEach((user) => {
      user.peer.on('onStreamStart', updateFn)
      user.peer.on('onStreamStop', updateFn)
    })

    return () => {
      users.forEach((user) => {
        user.peer.off('onStreamStart', updateFn)
        user.peer.off('onStreamStop', updateFn)
      })
    }
  }, [update, users])

  const streams = Object.values(users).reduce<UserWithStream[]>((prev, curent) => {
    Object.entries(curent.peer.remoteStreams).forEach(([type, stream]) => {
      if (!stream) return
      if (type === 'mic') return
      prev.push({
        user: curent,
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
      type: 'screen' as StreamType,
    })
  if (webCamStream)
    localStreams.push({
      stream: webCamStream,
      name: localUser.username,
      autoplay: true,
      type: 'webCam' as StreamType,
    })

  const someStreamIsHide = hiddenStreams.length > 0

  return (
    <StreamViewer
      className={classNames(styles.RoomStreams, {
        [styles.RoomStreamsWithHiddenStream]: !!someStreamIsHide,
      })}
    >
      {miniGame.map((engine) => (
        <div key={engine.id}>
          {engine.type === 'TicTacToe' && <TicTacToeMultiplayer game={engine as TicTacToeGame} />}
        </div>
      ))}

      {localStreams.map(({ stream, name, autoplay, type }) => (
        <RoomStream
          type={type}
          key={stream.id}
          stream={stream}
          title={name}
          autoplay={autoplay}
          mute
          volume={0}
          isLocal
        />
      ))}

      {streams.map(({ stream, user, type }) => (
        <RoomStream
          key={stream.id}
          type={type}
          user={user}
          stream={stream}
          title={user?.user.username ?? user?.id}
          onPlay={() => {
            user.peer.sendMessageToPeer('stream_track_resume', type)
          }}
          onPause={() => {
            user.peer.sendMessageToPeer('stream_track_pause', type)
          }}
          onVolumeChange={(value) => {
            changeUserStreamVolume(user, value)
          }}
          volume={streamVolumeList[user.user.username]?.[type] ?? 0}
          autoplay
        />
      ))}
    </StreamViewer>
  )
})

