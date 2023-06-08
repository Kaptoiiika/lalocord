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
import { useRoomRTCStore } from "@/entities/RTCClient"
import { useChatStore } from "@/widgets/Chat/model/store/ChatStore"

export const useWebRTCRoom = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const addMessageToChat = useChatStore((store) => store.addMessage)
  const deleteUser = useRoomRTCStore(getActionDeleteConnectedUsers)

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
    Object.values(users).forEach((client) => {
      client.channel.on("newMessage", addMessageToChat)
    })

    return () => {
      Object.values(users).forEach((client) => {
        client.channel.off("newMessage", addMessageToChat)
      })
    }
  }, [addMessageToChat, users])

  useEffect(() => {
    const initClients = (users: UserModel[]) => {
      users.map((user) => createNewUser(user, true))
    }

    const addUser = (user: UserModel) => {
      const alreadyInList = getUserById(user.id)
      if (alreadyInList) {
        console.warn(`User ${alreadyInList} is already in list`)
      }
      createNewUser(user)
    }

    const userDisconnect = (user: ClientId) => {
      getUserById(user.id)?.close()
      deleteRef.current(user.id)
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
  }, [])

  const handleSendMessage = useCallback((msg: string) => {
    Object.values(usersRef.current).forEach((user) => {
      user.channel.sendMessage(msg)
    })
  }, [])

  const handleSendBlob = useCallback((blob: Blob) => {
    Object.values(usersRef.current).forEach((user) => {
      user.channel.sendBlob(blob)
    })
  }, [])

  return {
    handleSendMessage,
    handleSendBlob,
  }
}
