import { UserModel } from "@/entities/User"
import { socketClient } from "@/shared/api/socket/socket"
import { useRef, useEffect, useCallback } from "react"
import {
  getActionDeleteConnectedUsers,
  getRoomUsers,
} from "../../model/selectors/RoomRTCSelectors"
import {
  Answer,
  ClientId,
  Ice,
  Offer,
  RTCClient,
} from "../../../../entities/RTCClient/lib/RTCClient/RTCClient"
import {
  RTCChatMessage,
  TransmissionMessage,
  useRoomRTCStore,
} from "@/entities/RTCClient"
import { useChatStore } from "@/widgets/Chat/model/store/ChatStore"
import { useAudio } from "@/entities/AudioEffect"
import { AudioName } from "@/entities/AudioEffect/model/types/AudioEffectSchema"

export const useWebRTCRoom = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const addMessage = useChatStore((store) => store.addNewMessage)
  const deleteUser = useRoomRTCStore(getActionDeleteConnectedUsers)
  const joinToRoomAudioPlay = useAudio(AudioName.joinToRoom)
  const exitFromRoomAudioPlay = useAudio(AudioName.exitFromRoom)

  const usersRef = useRef(users)
  usersRef.current = users
  const deleteRef = useRef(deleteUser)
  deleteRef.current = deleteUser

  const createNewUser = (user: UserModel, createOffer?: boolean) => {
    const newUser = new RTCClient(user, createOffer)
    return newUser
  }

  const getUserById = (id: string): RTCClient | undefined => {
    const user = usersRef.current[id]
    return user
  }

  useEffect(() => {
    const fnList = Object.values(users).map((client) => {
      const fn = (message: RTCChatMessage) => {
        addMessage(message, client.user)
      }
      const fn2 = (transmission: TransmissionMessage) => {
        addMessage(transmission, client.user)
      }
      client.dataChannel.on("transmission", fn2)
      client.dataChannel.on("newMessage", fn)
      return { client, fn, fn2 }
    })

    return () => {
      fnList.forEach(({ client, fn, fn2 }) => {
        client.dataChannel.off("newMessage", fn)
        client.dataChannel.off("transmission", fn2)
      })
    }
  }, [addMessage, users])

  useEffect(() => {
    const initClients = (users: UserModel[]) => {
      users.map((user) => createNewUser(user, true))
    }

    const addUser = (user: UserModel) => {
      const alreadyInList = getUserById(user.id)
      if (alreadyInList) {
        console.warn(`User ${alreadyInList.id} is already in list`)
      }
      createNewUser(user)
      joinToRoomAudioPlay()
    }

    const userDisconnect = (user: ClientId) => {
      getUserById(user.id)?.close()
      deleteRef.current(user.id)
      exitFromRoomAudioPlay()
    }

    const saveAnswer = (data: Answer & ClientId) => {
      const { id, answer } = data
      const user = getUserById(id)
      user?.saveAnswer(answer)
    }
    const createAnswer = (data: Offer & ClientId) => {
      const { id, offer } = data
      const user = getUserById(id)
      user?.createAnswer(offer)
    }
    const saveIce = (data: Ice & ClientId) => {
      const { id, ice } = data
      const user = getUserById(id)
      user?.saveIce(ice)
    }

    socketClient.on("users_in_room", initClients)
    socketClient.on("user_join", addUser)
    socketClient.on("user_leave", userDisconnect)

    socketClient.on("new_answer", saveAnswer)
    socketClient.on("new_offer", createAnswer)
    socketClient.on("new_ice", saveIce)

    return () => {
      socketClient.off("users_in_room", initClients)
      socketClient.off("user_join", addUser)
      socketClient.off("user_leave", userDisconnect)
      socketClient.off("new_answer", saveAnswer)
      socketClient.off("new_offer", createAnswer)
      socketClient.off("new_ice", saveIce)
    }
  }, [exitFromRoomAudioPlay, joinToRoomAudioPlay])

  const handleSendMessage = useCallback((msg: string) => {
    Object.values(usersRef.current).forEach((user) => {
      user.dataChannel.sendMessage(msg)
    })
  }, [])

  const handleSendBlob = useCallback((blob: Blob) => {
    Object.values(usersRef.current).forEach((user) => {
      user.dataChannel.sendBlob(blob)
    })
  }, [])

  return {
    handleSendMessage,
    handleSendBlob,
  }
}
