import { useCallback, useEffect, useRef } from 'react'

import { useWebRTCStore, WebRTCClient } from 'src/entities/WebRTC'
import { socketClient } from 'src/shared/api'
import { useChatStore } from 'src/widgets/Chat/model/store/ChatStore'

import type { UserModel } from 'src/entities/User'

import { useWebRTCRoomStore } from '../model/WebRTCRoomStore'

type Answer = { answer: RTCSessionDescription }
type Offer = { offer: RTCSessionDescription }
type Ice = { ice: RTCIceCandidateInit }
type ClientId = { id: number }
type UserConnectModel = UserModel

export const useWebRTCRoom = () => {
  const { users, addUser, removeUser } = useWebRTCRoomStore()
  const { streams } = useWebRTCStore()
  const { mic, screen, webCam } = streams
  const userMapRef = useRef(users)
  userMapRef.current = users

  const handleGetUserPeer = useCallback(
    (userId: number) => userMapRef.current.find((user) => user.id === userId)?.peer,
    []
  )

  const handleAddUser = useCallback(
    (user: UserConnectModel, peer: WebRTCClient) =>
      addUser({
        id: user.id,
        user,
        peer,
      }),
    [addUser]
  )

  useEffect(() => {
    if (screen) {
      userMapRef.current.forEach(({ peer }) => {
        peer.sendStream(screen, 'screen')
      })
    } else {
      userMapRef.current.forEach(({ peer }) => {
        peer.stopStream('screen')
      })
    }
  }, [screen])

  useEffect(() => {
    if (webCam) {
      userMapRef.current.forEach(({ peer }) => {
        peer.sendStream(webCam, 'webCam')
      })
    } else {
      userMapRef.current.forEach(({ peer }) => {
        peer.stopStream('webCam')
      })
    }
  }, [webCam])

  useEffect(() => {
    if (mic) {
      userMapRef.current.forEach(({ peer }) => {
        peer.sendStream(mic, 'mic')
      })
    } else {
      userMapRef.current.forEach(({ peer }) => {
        peer.stopStream('mic')
      })
    }
  }, [mic])

  useEffect(() => {
    const addUser = (user: UserConnectModel, waitOffer = false) => {
      const webRTCClient = new WebRTCClient({ id: user.id })
      handleAddUser(user, webRTCClient)

      webRTCClient.on('onChatMessage', (message) => {
        useChatStore.getState().addNewMessage({ type: 'text', id: crypto.randomUUID(), message }, user)
      })

      if (!waitOffer) webRTCClient.createOffer()
    }

    const initClients = (users: UserConnectModel[]) => {
      users.map((user) => addUser(user, true))
    }

    const saveAnswer = (data: Answer & ClientId) => {
      const { id, answer } = data
      const webRTCClient = handleGetUserPeer(id)
      webRTCClient?.setRemoteDescription(answer)
    }

    const createAnswer = async (data: Offer & ClientId) => {
      const { id, offer } = data
      const webRTCClient = handleGetUserPeer(id)
      webRTCClient?.setRemoteDescription(offer)
      webRTCClient?.createAnswer()
    }

    const saveIce = (data: Ice & ClientId) => {
      const { id, ice } = data
      const webRTCClient = handleGetUserPeer(id)
      webRTCClient?.addIceCandidate(ice)
    }

    const userDisconnect = (user: ClientId) => {
      const webRTCClient = handleGetUserPeer(user.id)
      webRTCClient?.close()
      removeUser(user.id)
    }

    const reconnect = (user: UserConnectModel) => {
      userDisconnect({ id: user.id })
      addUser(user)
    }

    socketClient.on('new_answer', saveAnswer)
    socketClient.on('new_offer', createAnswer)
    socketClient.on('new_ice', saveIce)
    socketClient.on('user_join', addUser)
    socketClient.on('users_in_room', initClients)
    socketClient.on('user_leave', userDisconnect)
    socketClient.on('reconnect', reconnect)

    return () => {
      socketClient.off('new_answer', saveAnswer)
      socketClient.off('new_offer', createAnswer)
      socketClient.off('new_ice', saveIce)
      socketClient.off('user_join', addUser)
      socketClient.off('users_in_room', initClients)
      socketClient.off('user_leave', userDisconnect)
      socketClient.off('reconnect', reconnect)
    }
  }, [handleAddUser, handleGetUserPeer, removeUser])

  const handleSendMessage = useCallback((message: string) => {
    userMapRef.current.forEach(({ peer }) => {
      peer.sendMessageToChat(message)
    })
  }, [])

  const handleSendFile = useCallback((blob: Blob, name?: string) => {
    userMapRef.current.forEach(({ peer }) => {
      peer.sendFileToChat(blob, name)
    })
  }, [])

  return { handleSendMessage, handleSendFile }
}

