import { useCallback, useEffect, useRef } from 'react'

import { useAudioEffectStore, AudioName } from 'src/entities/AudioEffect'
import { useWebRTCStore, WebRTCClient } from 'src/entities/WebRTC'
import { TicTacToeGame } from 'src/features/TicTacToe'
import { socketClient } from 'src/shared/api'
import { useChatStore } from 'src/widgets/Chat/model/store/ChatStore'

import type { UserModel } from 'src/entities/User'
import type {
  WebRTCTransmissionMessage,
  WebRTCChatMessage,
  WebRTCMiniGameMessage,
} from 'src/entities/WebRTC/lib/WebRTCClient'

import { useWebRTCRoomStore } from '../model/WebRTCRoomStore'

type Answer = { answer: RTCSessionDescription }
type Offer = { offer: RTCSessionDescription }
type Ice = { ice: RTCIceCandidateInit }
type ClientId = { id: string }
type UserConnectModel = UserModel

export const useWebRTCRoom = () => {
  const { users, addUser, addMiniGame, removeUser } = useWebRTCRoomStore()
  const { streams, bitrate } = useWebRTCStore()
  const playAudio = useAudioEffectStore((state) => state.play)
  const { mic, screen, webCam } = streams
  const userMapRef = useRef(users)
  userMapRef.current = users

  useEffect(() => {
    userMapRef.current.forEach(({ peer }) => {
      peer.setVideoBitrate(bitrate)
    })
  }, [bitrate])

  const handleGetUserPeer = useCallback(
    (userId: string) => userMapRef.current.find((user) => user.id === userId)?.peer,
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
    const chatMessageListeners = new Map<string, () => void>()

    users.forEach(({ peer, user }) => {
      const onChatMessage = (message: string) => {
        playAudio(AudioName.notification)
        useChatStore.getState().addNewMessage({ type: 'text', id: crypto.randomUUID(), message }, user)
      }

      const onChatMessageLoadFile = (message: WebRTCTransmissionMessage) => {
        useChatStore.getState().addNewMessage({ type: 'transmission', ...message }, user)
      }

      const onChatMessageFile = (message: WebRTCChatMessage) => {
        playAudio(AudioName.notification)
        useChatStore.getState().addNewMessage({ type: 'file', ...message }, user)
      }

      const onMiniGameRequsest = (message: WebRTCMiniGameMessage) => {
        if (message.action === 'request') playAudio(AudioName.notification)

        if (message.action === 'accept')
          addMiniGame({
            id: message.gameId,
            userId: user.id,
            type: message.gameType,
            engine: new TicTacToeGame({ id: message.gameId, peer, isCross: false }),
          })

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
    const addUser = (user: UserConnectModel, waitOffer = false) => {
      const webRTCClient = new WebRTCClient({ id: user.id })
      handleAddUser(user, webRTCClient)
      if (!waitOffer) playAudio(AudioName.joinToRoom)
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
      playAudio(AudioName.exitFromRoom)
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
  }, [handleAddUser, handleGetUserPeer, playAudio, removeUser])

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
