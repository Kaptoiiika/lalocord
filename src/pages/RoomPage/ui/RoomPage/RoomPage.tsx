import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocalUserStore } from 'src/entities/User'
import { WaitUserClick } from 'src/features/WaitUserClick'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'
import { socketClient } from 'src/shared/api'
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

const RoomPageWrapper = () => {
  const { id = '' } = useParams()
  const { joinRoom, leaveRoom } = useWebRTCRoomStore()
  const [roomIsFull, setRoomIsFull] = useState(false)
  useEffect(() => {
    joinRoom(id)
    const fn = emitToJoinRoom(id)
    const prevName = document.title

    document.title = `${document.title} - ${id}`

    return () => {
      document.title = prevName
      leaveRoom()
      socketClient.off('room_is_full')
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

  useEffect(() => {
    const fn = () => {
      setRoomIsFull(true)
    }

    socketClient.on('room_is_full', fn)

    return () => {
      socketClient.off('room_is_full', fn)
    }
  }, [])

  return <RoomLobby isFull={roomIsFull} />
}

export const RoomPage = () => (
  <PageWrapper>
    <WaitUserClick>
      <RoomPageWrapper />
    </WaitUserClick>
  </PageWrapper>
)
