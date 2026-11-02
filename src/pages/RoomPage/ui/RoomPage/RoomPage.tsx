import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useLocalUserStore } from 'src/entities/User'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useRemoteControlHost } from 'src/features/RemoteControl'
import { WaitUserClick } from 'src/features/WaitUserClick'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { socketClient } from 'src/shared/api'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { PageWrapper } from 'src/widgets/Page'

import { RoomLobby } from '../RoomLobby/RoomLobby'

const emitToJoinRoom = (id: string) => {
  const localUser = useLocalUserStore.getState().localUser

  socketClient.emit('join', {
    name: id,
    username: localUser.username,
    avatar: localUser.avatar,
  })

  return () => {
    useWebRTCRoomStore.getState().leaveRoom()
    socketClient.emit('leave', {
      name: id,
    })
  }
}

const ElectronRemoteControlHost = () => {
  useRemoteControlHost()

  return null
}

const RoomPageWrapper = () => {
  const { id = '' } = useParams()
  const { joinRoom, leaveRoom } = useWebRTCRoomStore()

  useEffect(() => {
    joinRoom(id)
    const fn = emitToJoinRoom(id)
    const prevName = document.title

    document.title = `${document.title} - ${id}`

    return () => {
      document.title = prevName
      leaveRoom()
      useWebRTCStore.getState().stopStream('mic')
      useWebRTCStore.getState().stopStream('screen')
      useWebRTCStore.getState().stopStream('webCam')
      fn()
    }
  }, [id, joinRoom, leaveRoom])

  useEffect(() => {
    let isConnected = socketClient.active

    const handleConnect = () => {
      if (isConnected === false) {
        const localUser = useLocalUserStore.getState().localUser

        socketClient.emit('join', {
          name: id,
          username: localUser.username,
          avatar: localUser.avatar,
          reconnect: true,
        })
      }
      isConnected = true
    }

    const handleDisconnect = () => {
      isConnected = false
    }

    socketClient.on('connect', handleConnect)
    socketClient.on('disconnect', handleDisconnect)

    return () => {
      socketClient.off('connect', handleConnect)
      socketClient.off('disconnect', handleDisconnect)
    }
  }, [id])

  return (
    <>
      {__IS_ELECTRON__ && <ElectronRemoteControlHost />}
      <RoomLobby />
    </>
  )
}

export const RoomPage = () => (
  <PageWrapper>
    <WaitUserClick>
      <RoomPageWrapper />
    </WaitUserClick>
  </PageWrapper>
)
