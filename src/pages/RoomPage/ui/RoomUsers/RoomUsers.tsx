import { useState } from 'react'

import { IconButton, Popover, Stack, Typography } from '@mui/material'
import { Tooltip } from '@mui/material'
import { useLocalUserStore, UserCard } from 'src/entities/User'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { VolumeMeter } from 'src/features/VolumeMetter/ui/VolumeMeter'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'
import { AvatarUser } from 'src/shared/ui/Avatar'

import { RoomUserItem } from './RoomUserItem/RoomUserItem'

import styles from './RoomUsers.module.scss'

export const RoomUsers = () => {
  const users = useWebRTCRoomStore((state) => state.users)
  const roomName = useWebRTCRoomStore((state) => state.roomId)
  const microphoneStream = useWebRTCStore((state) => state.streams.mic)
  const localUsername = useLocalUserStore((state) => state.localUser)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const userList = Object.values(users)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div className={styles['RoomUsers']}>
      <Stack
        className={styles.users}
        direction="row"
        gap={1}
      >
        <IconButton
          sx={{
            p: 0,
          }}
          onContextMenu={handleClick}
          onClick={handleClick}
          aria-label={localUsername.username || 'You'}
        >
          <Tooltip
            title={localUsername.username || 'You'}
            describeChild
          >
            <div className={styles.localUser}>
              <AvatarUser
                borderColor={microphoneStream?.active ? 'green' : 'grey'}
                username={localUsername.username || 'You'}
                avatarUrl={localUsername.avatar}
                size="small"
              />
              {microphoneStream && <VolumeMeter stream={microphoneStream} />}
            </div>
          </Tooltip>
        </IconButton>

        {userList.map((user) => (
          <RoomUserItem
            key={user.id}
            user={user}
          />
        ))}
      </Stack>
      <Stack
        className={styles.roomName}
        justifyContent="center"
      >
        <Typography variant="h6" fontWeight={600}>{roomName}</Typography>
      </Stack>

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
          username={localUsername.username || 'You'}
          avatarUrl={localUsername.avatar}
        />
      </Popover>
    </div>
  )
}
