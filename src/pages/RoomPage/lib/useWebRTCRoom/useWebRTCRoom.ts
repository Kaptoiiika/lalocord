import { socketClient } from "@/shared/api/socket/socket"
import { useState, useRef, useEffect } from "react"
import { Message, User } from "../../model/types/RoomSchema"
import { Answer, ClientId, Ice, Offer, RTCClient } from "../RTCClient/RTCClient"

export const useWebRTCRoom = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [, update] = useState(0)
  const [users, setUsers] = useState<RTCClient[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  const usersRef = useRef(users)
  const localStreamRef = useRef(localStream)
  usersRef.current = users
  localStreamRef.current = localStream

  const createNewUser = (user: User, createOffer?: boolean) => {
    const newUser = new RTCClient(user, createOffer)
    newUser.on("newMessage", (msg: string) => {
      setMessages((prev) => [...prev, { user: user, data: msg }])
    })
    newUser.on("startStreamVideo", () => {
      update((prev) => prev + 1)
    })

    if (localStreamRef.current) newUser.sendStream(localStreamRef.current)
    return newUser
  }

  const getUserById = (id: string) => {
    const user = usersRef.current.find((usr) => usr.id === id)
    return user
  }

  useEffect(() => {
    const initClients = (users: User[]) => {
      setUsers(users.map((user) => createNewUser(user, true)))
    }

    const addUser = (user: ClientId) => {
      setUsers((prev) => {
        const alreadyInList = prev.find((usr) => usr.id === user.id)
        if (alreadyInList) {
          console.warn(`User ${alreadyInList} is already in list`)
          return prev
        }
        const newUser = createNewUser(user.id)
        return [...prev, newUser]
      })
    }

    const deleteUser = (user: ClientId) => {
      setUsers((prev) => {
        const leaveUser = prev.find((usr) => usr.id === user.id)
        leaveUser?.close()
        return prev.filter((usr) => usr.id !== user.id)
      })
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
    socketClient.on("user_leave", deleteUser)

    socketClient.on("new_answer", saveAnswer)
    socketClient.on("new_offer", createAnswer)
    socketClient.on("new_ice", saveIce)

    return () => {
      setUsers((prev) => {
        prev.forEach((client) => client.close())
        usersRef.current = []
        return []
      })
      socketClient.off("users_in_room", initClients)
      socketClient.off("user_join", addUser)
      socketClient.off("user_leave", deleteUser)
      socketClient.off("new_answer", saveAnswer)
      socketClient.off("new_offer", createAnswer)
      socketClient.off("new_ice", saveIce)
    }
  }, [])

  const hundleSendMessage = (msg: string) => {
    setMessages((prev) => [...prev, { user: "me", data: msg }])
    users.forEach((user) => {
      user.sendMessage(msg)
    })
  }

  const hundleStartLocalStream = (stream: MediaStream) => {
    setLocalStream(stream)
    users.forEach((user) => {
      user.sendStream(stream)
    })
  }

  return {
    users,
    messages,
    localStream,
    hundleStartLocalStream,
    hundleSendMessage,
  }
}
