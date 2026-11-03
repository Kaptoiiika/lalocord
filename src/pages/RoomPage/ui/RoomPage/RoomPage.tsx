import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { getRoomToken, removeRoomToken, saveRoomToken } from 'src/entities/Room'
import { useLocalUserStore } from 'src/entities/User'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { useRemoteControlHost } from 'src/features/RemoteControl'
import { WaitUserClick } from 'src/features/WaitUserClick'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { socketClient } from 'src/shared/api'
import { AppRoutes } from 'src/shared/config'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { PageWrapper } from 'src/widgets/Page'

import type { RoomPageLocationState } from 'src/entities/Room'

import { RoomLobby } from '../RoomLobby/RoomLobby'
import { RoomPasswordModal } from '../RoomPasswordModal/RoomPasswordModal'

const ElectronRemoteControlHost = () => {
  useRemoteControlHost()

  return null
}

const RoomPageWrapper = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const createPassword = (location.state as RoomPageLocationState | null)?.password
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [isWrongPassword, setIsWrongPassword] = useState(false)
  const [syncedJoin, setSyncedJoin] = useState({ id, createPassword })
  const { joinRoom, leaveRoom } = useWebRTCRoomStore()

  if (syncedJoin.id !== id || syncedJoin.createPassword !== createPassword) {
    setSyncedJoin({ id, createPassword })
    setIsPasswordRequired(false)
    setIsWrongPassword(false)
  }

  const emitJoin = useCallback(
    (password?: string, isReconnect = false) => {
      const localUser = useLocalUserStore.getState().localUser

      socketClient.emit('join', {
        name: id,
        username: localUser.username,
        avatar: localUser.avatar,
        token: getRoomToken(id),
        ...(password ? { password } : {}),
        ...(isReconnect ? { reconnect: true } : {}),
      })
    },
    [id]
  )

  useEffect(() => {
    joinRoom(id)
    const prevName = document.title

    document.title = `${document.title} - ${id}`

    const handlePasswordRequired = (payload: { isWrongPassword?: boolean }) => {
      removeRoomToken(id)
      setIsPasswordRequired(true)
      setIsWrongPassword(Boolean(payload?.isWrongPassword))
    }

    const handleRoomToken = (payload: { token?: string }) => {
      if (!payload?.token) return

      saveRoomToken(id, payload.token)
      setIsPasswordRequired(false)
      setIsWrongPassword(false)
    }

    socketClient.on('room_password_required', handlePasswordRequired)
    socketClient.on('room_token', handleRoomToken)
    emitJoin(createPassword)

    return () => {
      document.title = prevName
      leaveRoom()
      useWebRTCStore.getState().stopStream('mic')
      useWebRTCStore.getState().stopStream('screen')
      useWebRTCStore.getState().stopStream('webCam')
      useWebRTCRoomStore.getState().leaveRoom()
      socketClient.emit('leave', { name: id })
      socketClient.off('room_password_required', handlePasswordRequired)
      socketClient.off('room_token', handleRoomToken)
    }
  }, [createPassword, emitJoin, id, joinRoom, leaveRoom])

  useEffect(() => {
    let isConnected = socketClient.active

    const handleConnect = () => {
      if (isConnected === false) {
        emitJoin(undefined, true)
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
  }, [emitJoin])

  const handleSubmitPassword = (password: string) => {
    emitJoin(password)
  }

  const handleCancelPassword = () => {
    navigate(AppRoutes.MAIN_PAGE)
  }

  return (
    <>
      {__IS_ELECTRON__ && <ElectronRemoteControlHost />}
      <RoomLobby />
      {isPasswordRequired && (
        <RoomPasswordModal
          open
          isWrongPassword={isWrongPassword}
          onSubmit={handleSubmitPassword}
          onCancel={handleCancelPassword}
        />
      )}
    </>
  )
}

export const RoomPage = () => (
  <PageWrapper className="relative isolate">
    <WaitUserClick>
      <RoomPageWrapper />
    </WaitUserClick>
  </PageWrapper>
)
