import { RTCClient } from "@/pages/RoomPage/lib/RTCClient/RTCClient"
import { UserAvatar, UserAvatarStatus } from "@/shared/ui/UserAvatar/UserAvatar"
import { useEffect, useState } from "react"

type RoomUserItemProps = {
  client: RTCClient
}

const getUserStatusOnConnectionState = (
  connectionsState?: RTCIceConnectionState
): UserAvatarStatus => {
  switch (connectionsState) {
    case "completed":
    case "connected":
      return "online"
    case "checking":
    case "new":
      return "idle"
    case "closed":
    case "disconnected":
    case "failed":
    default:
      return "offline"
  }
}

export const RoomUserItem = (props: RoomUserItemProps) => {
  const { client } = props
  const [status, setStatus] = useState(
    getUserStatusOnConnectionState(client.peer?.iceConnectionState)
  )

  useEffect(() => {
    const fn = () => {
      setStatus(getUserStatusOnConnectionState(client.peer?.iceConnectionState))
    }
    client.on("iceconnectionStatusChange", fn)
    return () => {
      client.off("iceconnectionStatusChange", fn)
    }
  }, [client])

  return (
    <UserAvatar
      key={client.id}
      alt={client.user?.username || client.id}
      status={status}
    />
  )
}
