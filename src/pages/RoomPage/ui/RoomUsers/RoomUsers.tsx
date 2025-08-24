import { Stack, Typography } from '@mui/material';
import { Tooltip } from '@mui/material';
import { useRoomRTCStore } from 'src/entities/RTCClient';
import {
  getMicrophoneStream,
  getRoomName,
  getRoomUsers,
} from 'src/entities/RTCClient/model/selectors/RoomRTCSelectors';
import { useLocalUserStore } from 'src/entities/User';
import { VolumeMeter } from 'src/features/VolumeMetter/ui/VolumeMeter';
import { UserAvatar } from 'src/shared/ui/UserAvatar/UserAvatar';

import { RoomUserItem } from './RoomUserItem/RoomUserItem';

import styles from './RoomUsers.module.scss';

export const RoomUsers = () => {
  const users = useRoomRTCStore(getRoomUsers);
  const roomName = useRoomRTCStore(getRoomName);
  const microphoneStream = useRoomRTCStore(getMicrophoneStream);
  const localUsername = useLocalUserStore((state) => state.localUser);

  const userList = Object.values(users);

  return (
    <div className={styles['RoomUsers']}>
      <Stack
        className={styles.users}
        direction="row"
        gap={1}
      >
        <Tooltip title={localUsername.username || 'You'} describeChild>
          <div className={styles.localUser}>
            <UserAvatar
              micOnline={microphoneStream?.active}
              alt={localUsername.username || 'You'}
              src={localUsername.avatarSrc}
            />
            {microphoneStream && <VolumeMeter stream={microphoneStream} />}
          </div>
        </Tooltip>

        {userList.map((client) => <RoomUserItem key={client.id} client={client} />)}
      </Stack>
      <Stack className={styles.roomName} justifyContent="center">
        <Typography variant="h6">{roomName}</Typography>
      </Stack>
    </div>
  );
};
