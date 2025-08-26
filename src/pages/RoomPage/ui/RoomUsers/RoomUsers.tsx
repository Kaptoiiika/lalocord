import { Stack, Typography } from '@mui/material'
import { Tooltip } from '@mui/material'
import { useLocalUserStore } from 'src/entities/User'
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

  const userList = Object.values(users)

  return (
    <div className={styles['RoomUsers']}>
      <Stack
        className={styles.users}
        direction="row"
        gap={1}
      >
        <Tooltip
          title={localUsername.username || 'You'}
          describeChild
        >
          <div className={styles.localUser}>
            <AvatarUser
              borderColor={microphoneStream?.active ? 'green' : 'grey'}
              username={localUsername.username || 'You'}
              avatarUrl={localUsername.avatarSrc}
              size="small"
            />
            {microphoneStream && <VolumeMeter stream={microphoneStream} />}
          </div>
        </Tooltip>

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
        <Typography variant="h6">{roomName}</Typography>
      </Stack>
    </div>
  )
}
