import { useCallback, useEffect, useRef } from 'react'

import { useAudioEffectStore, AudioName } from 'src/entities/AudioEffect'
import { useLocalUserStore, type UserModel } from 'src/entities/User'
import { useWebRTCStore, WebRTCClient } from 'src/entities/WebRTC'
import { socketClient } from 'src/shared/api'
import { useChatStore } from 'src/widgets/Chat/model/store/ChatStore'

import type {
  WebRTCTransmissionMessage,
  WebRTCChatMessage,
  WebRTCMiniGameMessage,
} from 'src/entities/WebRTC/lib/WebRTCClient'

import { useWebRTCRoomStore } from '../model/WebRTCRoomStore'

type Answer = { answer: RTCSessionDescriptionInit }
type Offer = { offer: RTCSessionDescriptionInit }
type Ice = { ice: RTCIceCandidateInit }
type ClientId = { id: string }
type ConnectionId = { connectionId?: string }
type UserConnectModel = UserModel

export const useWebRTCRoom = () => {
  const { users, addUser, replaceUsers, addMiniGame, removeUser } = useWebRTCRoomStore()
  const { streams, bitrate } = useWebRTCStore()
  const playAudio = useAudioEffectStore((state) => state.play)
  const { mic, screen, webCam } = streams
  const userMapRef = useRef(users)

  useEffect(() => {
    userMapRef.current = users
  }, [users])

  useEffect(() => {
    userMapRef.current.forEach(({ peer }) => {
      peer.setVideoBitrate(bitrate)
    })
  }, [bitrate])

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
    const chatMessageListeners = new Map<string, () => void>()

    users.forEach(({ peer, user }) => {
      const onChatMessage = (message: string) => {
        playAudio(AudioName.notification)
        useChatStore.getState().addNewMessage({ type: 'text', id: crypto.randomUUID(), message }, user)
      }

      const onChatMessageLoadFile = (message: WebRTCTransmissionMessage) => {
        const localUser = message?.transmission?.isSender ? useLocalUserStore.getState().localUser : user
        useChatStore.getState().addNewMessage({ type: 'transmission', ...message }, { ...user, id: localUser.id })
      }

      const onChatMessageFile = (message: WebRTCChatMessage) => {
        playAudio(AudioName.notification)
        useChatStore.getState().addNewMessage({ type: 'file', ...message }, user)
      }

      const onMiniGameRequsest = (message: WebRTCMiniGameMessage) => {
        if (message.action === 'request') playAudio(AudioName.notification)

        if (message.action === 'accept')
          addMiniGame({ gameType: message.gameType, peer, id: message.gameId, isHost: true })

        useChatStore.getState().addNewMessage({ type: 'miniGameRequest', id: message.gameId, ...message }, user)
      }

      peer.on('onChatMessage', onChatMessage)
      peer.on('onChatMessageLoadFile', onChatMessageLoadFile)
      peer.on('onChatMessageFile', onChatMessageFile)
      peer.on('onMiniGameRequsest', onMiniGameRequsest)

      chatMessageListeners.set(peer.id, () => {
        peer.off('onChatMessage', onChatMessage)
        peer.off('onChatMessageLoadFile', onChatMessageLoadFile)
        peer.off('onChatMessageFile', onChatMessageFile)
        peer.off('onMiniGameRequsest', onMiniGameRequsest)
      })
    })

    return () => {
      chatMessageListeners.forEach((unsubscribe) => unsubscribe())
      chatMessageListeners.clear()
    }
  }, [users, playAudio, addMiniGame])

  useEffect(() => {
    const handleUserJoin = (user: UserConnectModel) => {
      const peer = new WebRTCClient({ id: user.id, isInitiator: true })
      addUser({
        id: user.id,
        user,
        peer,
      })
      playAudio(AudioName.joinToRoom)
      void peer.createOffer()
    }

    const handleUsersInRoom = (roomUsers: UserConnectModel[]) => {
      replaceUsers(
        roomUsers.map((user) => ({
          id: user.id,
          user,
          peer: new WebRTCClient({ id: user.id, isInitiator: false }),
        }))
      )
    }

    const handleOffer = (data: Offer & ClientId & ConnectionId) => {
      const roomUser = useWebRTCRoomStore.getState().users.find((user) => user.id === data.id)
      if (!roomUser) return

      const isForeignConnection =
        Boolean(roomUser.peer.connectionId) &&
        Boolean(data.connectionId) &&
        roomUser.peer.connectionId !== data.connectionId

      if (isForeignConnection) {
        const peer = new WebRTCClient({ id: data.id, isInitiator: false })
        addUser({
          id: data.id,
          user: roomUser.user,
          peer,
        })
        void peer.handleOffer(data.offer, data.connectionId)
        return
      }

      void roomUser.peer.handleOffer(data.offer, data.connectionId)
    }

    const handleAnswer = (data: Answer & ClientId & ConnectionId) => {
      const peer = useWebRTCRoomStore.getState().users.find((user) => user.id === data.id)?.peer
      void peer?.handleAnswer(data.answer, data.connectionId)
    }

    const handleIce = (data: Ice & ClientId & ConnectionId) => {
      const peer = useWebRTCRoomStore.getState().users.find((user) => user.id === data.id)?.peer
      void peer?.handleIce(data.ice, data.connectionId)
    }

    const handleRequestNewOffer = (data: ClientId) => {
      const peer = useWebRTCRoomStore.getState().users.find((user) => user.id === data.id)?.peer
      if (!peer?.isInitiator) return

      void peer.createOffer({ isIceRestart: true })
    }

    const handleUserLeave = (user: ClientId) => {
      removeUser(user.id)
      playAudio(AudioName.exitFromRoom)
    }

    socketClient.on('new_answer', handleAnswer)
    socketClient.on('new_offer', handleOffer)
    socketClient.on('new_ice', handleIce)
    socketClient.on('request_new_offer', handleRequestNewOffer)
    socketClient.on('user_join', handleUserJoin)
    socketClient.on('users_in_room', handleUsersInRoom)
    socketClient.on('user_leave', handleUserLeave)

    return () => {
      socketClient.off('new_answer', handleAnswer)
      socketClient.off('new_offer', handleOffer)
      socketClient.off('new_ice', handleIce)
      socketClient.off('request_new_offer', handleRequestNewOffer)
      socketClient.off('user_join', handleUserJoin)
      socketClient.off('users_in_room', handleUsersInRoom)
      socketClient.off('user_leave', handleUserLeave)
    }
  }, [addUser, playAudio, removeUser, replaceUsers])

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
