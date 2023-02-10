import { socketClient } from "@/shared/api/socket/socket"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { Stack } from "@mui/system"
import { useEffect, useRef, useState } from "react"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import { Message, User } from "../../model/types/RoomSchema"
import { RoomActions } from "../RoomActions/RoomActions"
import { RoomChat } from "../RoomChat/RoomChat"
import styles from "./RoomLobby.module.scss"

type RoomLobbyProps = {}

export const RoomLobby = (props: RoomLobbyProps) => {
  const {} = props
  const [messages, setMessages] = useState<Message[]>([])
  const [, update] = useState(0)
  const [users, setUsers] = useState<RTCClient[]>([])
  const localStream = useRef<MediaStream | null>(null)

  const createNewUser = (user: User, createOffer?: boolean) => {
    const newUser = new RTCClient(user, createOffer)
    newUser.on("newMessage", (msg: string) => {
      setMessages((prev) => [...prev, { user: user, data: msg }])
    })
    newUser.on("startStreamVideo", () => {
      update((prev) => prev + 1)
    })
    if (localStream.current) newUser.sendStream(localStream.current)
    return newUser
  }

  useEffect(() => {
    const getClients = (users: User[]) => {
      setUsers(users.map((user) => createNewUser(user, true)))
    }
    const addUser = (user: { id: string }) => {
      setUsers((prev) => {
        const alreadyInList = prev.find((curUser) => curUser.id === user.id)
        if (alreadyInList) {
          console.warn(`User ${alreadyInList} is already in list`)
          return prev
        }

        const newUser = createNewUser(user.id)
        return [...prev, newUser]
      })
    }
    const deleteUser = (user: { id: string }) => {
      setUsers((prev) => {
        const leaveUser = prev.find((curUser) => curUser.id === user.id)
        leaveUser?.close()

        return prev.filter((curUser) => curUser.id !== user.id)
      })
    }

    socketClient.on("users_in_room", getClients)
    socketClient.on("user_join", addUser)
    socketClient.on("user_leave", deleteUser)

    return () => {
      setUsers((prev) => {
        prev.forEach((client) => client.close())

        return []
      })
      socketClient.off("users_in_room", getClients)
      socketClient.off("user_join", addUser)
      socketClient.off("user_leave", deleteUser)
    }
  }, [])

  console.log(users)

  const hundleSendMessage = (msg: string) => {
    setMessages((prev) => [...prev, { user: "me", data: msg }])
    users.forEach((user) => {
      user.sendMessage(msg)
    })
  }
  const hundleStartLocalStream = (stream: MediaStream) => {
    localStream.current = stream
    users.forEach((user) => {
      user.sendStream(stream)
    })
  }

  return (
    <Stack justifyContent="space-between" direction="row" height="100%">
      <div className={styles.mainScreen}>
        <StreamViewer>
          {users.map((user) => (
            <div key={user.id}>
              <video
                style={{ width: "100%", height: "100%" }}
                id="remote-video"
                ref={(node) => {
                  if (node) node.srcObject = user.video
                }}
                autoPlay
                muted
              />
            </div>
          ))}
        </StreamViewer>
        <RoomActions
          startWebCamStream={hundleStartLocalStream}
          startDisplayMediaStream={hundleStartLocalStream}
        />
      </div>
      <RoomChat onSendMessage={hundleSendMessage} messages={messages} />
    </Stack>
  )
}
