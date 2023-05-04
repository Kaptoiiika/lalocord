import { RTCClient } from "@/entities/RTCClient/lib/RTCClient/RTCClient"
import { classNames } from "@/shared/lib/classNames/classNames"
import { UserAvatar, UserAvatarStatus } from "@/shared/ui/UserAvatar/UserAvatar"
import { IconButton, Menu, Tooltip } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import styles from "./RoomUserItem.module.scss"

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
  const [, update] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const fn = () => {
      setStatus(getUserStatusOnConnectionState(client.peer?.iceConnectionState))
    }
    client.on("iceconnectionStatusChange", fn)
    return () => {
      client.off("iceconnectionStatusChange", fn)
    }
  }, [client])

  useEffect(() => {
    const fn = () => {
      update((prev) => prev + 1)
    }
    client.media.on("newstream", fn)
    return () => {
      client.media.off("newstream", fn)
    }
  }, [client])

  const microphoneStream = client.media.remoteStream.microphone
  const username = client.user?.username || client.id
  if (microphoneStream && audioRef.current) {
    audioRef.current.srcObject = microphoneStream.stream
    audioRef.current.play()
  }

  return (
    <>
      <Tooltip title={username} describeChild>
        <IconButton sx={{ p: 0 }} onClick={handleClick} aria-label={username}>
          <UserAvatar
            className={classNames("", {
              [styles.micOnline]: !!microphoneStream?.isOpen,
            })}
            key={client.id}
            alt={username}
            status={status}
          />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted
        disablePortal
      >
        Volume:
        <audio ref={audioRef} controls />
      </Menu>
    </>
  )
}
