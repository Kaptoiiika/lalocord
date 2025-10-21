import { useEffect, useRef, useState } from 'react'

import { Typography, IconButton, Slider, Stack, Tooltip, Popover } from '@mui/material'
import { useAudioEffectStore } from 'src/entities/AudioEffect'
import { UserCard } from 'src/entities/User'
import { VolumeMeter } from 'src/features/VolumeMetter'
import { AvatarUserWithBadge } from 'src/shared/ui/Avatar'

import type { RoomUser } from 'src/features/WebRTCRoom'
import type { AvatarUserWithBadgeStatus } from 'src/shared/ui/Avatar'

import styles from './RoomUserItem.module.scss'

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const username = user.user.username ?? user.id
  const audioRef = useRef<HTMLAudioElement>(new Audio())
  const [gainNode, setGainNode] = useState<GainNode>()
  const [, update] = useState(0)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

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

    setGainNode(gainNode)
    context.resume()

    audioRef.current.srcObject = microphoneStream

    return () => {
      setGainNode(undefined)
      context.close()
    }
  }, [microphoneStream])

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = userVolume
    }
  }, [userVolume, gainNode])

  const handleChangeVolume = (event: Event, value: number | number[]) => {
    if (typeof value === 'number') {
      changeVolumeHandle(user.user.username, 'mic', value)
    }
  }

  const formatedMicroVolume = (userVolume * 100).toFixed(0)

  return (
    <>
      <Tooltip
        title={username}
        describeChild
      >
        <IconButton
          sx={{
            p: 0,
          }}
          onContextMenu={handleClick}
          onClick={handleClick}
          aria-label={username}
        >
          <AvatarUserWithBadge
            username={username}
            avatarUrl={user.user.avatar}
            borderColor={microphoneStream?.active ? 'green' : 'grey'}
            status={status}
            size="small"
          />
          {!!microphoneStream && microphoneStream.active && <VolumeMeter stream={microphoneStream} />}
        </IconButton>
      </Tooltip>
      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{ background: 'none', backgroundImage: 'none' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted
        disablePortal
      >
        <UserCard
          username={username}
          avatarUrl={user.user.avatar}
        >
          <Stack className={styles.menu}>
            <Typography>Volume: {formatedMicroVolume}</Typography>
            <Slider
              aria-label="microphone volume"
              value={userVolume}
              onChange={handleChangeVolume}
              step={0.01}
              min={0}
              max={3}
            />
          </Stack>
        </UserCard>
      </Popover>
    </>
  )
}
