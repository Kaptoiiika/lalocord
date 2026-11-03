import { useEffect, useRef, useState } from 'react'

import { useAudioEffectStore } from 'src/entities/AudioEffect'
import { UserCard } from 'src/entities/User'
import { VolumeMeter } from 'src/features/VolumeMetter'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { AvatarUserWithBadge, IconButton, Popup, Slider } from 'src/shared/ui'

import type { RoomUser } from 'src/features/WebRTCRoom'
import type { AvatarUserWithBadgeStatus } from 'src/shared/ui'

type RoomUserItemProps = {
  user: RoomUser
}

const getUserStatusOnConnectionState = (connectionsState?: RTCPeerConnectionState): AvatarUserWithBadgeStatus => {
  switch (connectionsState) {
    case 'connected':
      return 'online'
    case 'connecting':
    case 'new':
      return 'idle'
    case 'disconnected':
    case 'closed':
    default:
      return 'offline'
  }
}

export const RoomUserItem = (props: RoomUserItemProps) => {
  const { user } = props
  const [status, setStatus] = useState(getUserStatusOnConnectionState(user.peer.connectionState))
  const audioUserSettings = useAudioEffectStore((state) => state.usersAuidoSettings)
  const changeVolumeHandle = useAudioEffectStore((state) => state.changeUserVolume)
  const microphoneStream = user.peer.remoteStreams.mic
  const userVolume = audioUserSettings[user.user.username]?.mic ?? 1
  const { open, setOpen, handleOpen } = usePopup()
  const username = user.user.username ?? user.id
  const audioRef = useRef<HTMLAudioElement>(new Audio())
  const gainNodeRef = useRef<GainNode | null>(null)
  const [, update] = useState(0)

  useEffect(() => {
    const updateFn = () => {
      update((prev) => prev + 1)
    }
    user.peer.on('onStreamStart', updateFn)
    user.peer.on('onStreamStop', updateFn)

    return () => {
      user.peer.off('onStreamStart', updateFn)
      user.peer.off('onStreamStop', updateFn)
    }
  }, [user.peer])

  useEffect(() => {
    const fn = () => {
      setStatus(getUserStatusOnConnectionState(user.peer.connectionState))
    }
    const peer = user.peer.getPeer()

    peer.addEventListener('connectionstatechange', fn)

    return () => {
      peer.removeEventListener('connectionstatechange', fn)
    }
  }, [user.peer])

  useEffect(() => {
    if (!microphoneStream) return
    const context = new AudioContext()
    const source = context.createMediaStreamSource(microphoneStream)
    const gainNode = context.createGain()
    source.connect(gainNode)
    gainNode.connect(context.destination)
    gainNodeRef.current = gainNode
    context.resume()

    audioRef.current.srcObject = microphoneStream

    return () => {
      gainNodeRef.current = null
      context.close()
    }
  }, [microphoneStream])

  useEffect(() => {
    const gainNode = gainNodeRef.current
    if (!gainNode) return

    gainNode.gain.value = userVolume
  }, [userVolume, microphoneStream])

  const handleChangeVolume = (value: number) => {
    changeVolumeHandle(user.user.username, 'mic', value)
  }

  const formatedMicroVolume = (userVolume * 100).toFixed(0)

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      className="w-auto bg-transparent p-0 shadow-none ring-0"
      trigger={
        <IconButton
          tooltip={username}
          className="size-auto p-0"
          onContextMenu={handleOpen}
          onClick={handleOpen}
          aria-label={username}
        >
          <span className="relative">
            <AvatarUserWithBadge
              username={username}
              avatarUrl={user.user.avatar}
              borderColor={microphoneStream?.active ? 'green' : 'grey'}
              status={status}
              size="small"
            />
            {!!microphoneStream && microphoneStream.active && <VolumeMeter stream={microphoneStream} />}
          </span>
        </IconButton>
      }
    >
      <UserCard
        username={username}
        avatarUrl={user.user.avatar}
      >
        <div className="flex min-w-[280px] flex-col gap-2">
          <p>Volume: {formatedMicroVolume}</p>
          <Slider
            aria-label="microphone volume"
            value={userVolume}
            onValueChange={handleChangeVolume}
            step={0.01}
            min={0}
            max={3}
          />
        </div>
      </UserCard>
    </Popup>
  )
}
