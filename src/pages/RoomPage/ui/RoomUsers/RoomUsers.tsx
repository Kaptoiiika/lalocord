import { useUserStore } from "@/entities/User"
import { UserAvatar } from "@/shared/ui/UserAvatar/UserAvatar"
import { Stack, Typography } from "@mui/material"
import {
  getMicrophoneStream,
  getRoomName,
  getRoomUsers,
} from "@/entities/RTCClient/model/selectors/RoomRTCSelectors"
import { RoomUserItem } from "./RoomUserItem/RoomUserItem"
import styles from "./RoomUsers.module.scss"
import { Tooltip } from "@mui/material"
import { useRoomRTCStore } from "@/entities/RTCClient"
import { VolumeMeter } from "@/features/VolumeMetter/ui/VolumeMeter"

export const RoomUsers = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const roomName = useRoomRTCStore(getRoomName)
  const microphoneStream = useRoomRTCStore(getMicrophoneStream)
  const localUsername = useUserStore((state) => state.localUser)

  const userList = Object.values(users)

  return (
    <div className={styles["RoomUsers"]}>
      <Stack className={styles.users} direction="row" gap={1}>
        <Tooltip title={localUsername.username || "You"} describeChild>
          <div className={styles.localUser}>
            <UserAvatar
              micOnline={microphoneStream?.active}
              alt={localUsername.username || "You"}
              src={localUsername.avatarSrc}
            />
            {microphoneStream && <VolumeMeter stream={microphoneStream} />}
          </div>
        </Tooltip>

        {userList.map((client) => (
          <RoomUserItem key={client.id} client={client} />
        ))}
      </Stack>
      <Stack className={styles.roomName} justifyContent="center">
        <Typography variant="h6">{roomName}</Typography>
      </Stack>
    </div>
  )
}
