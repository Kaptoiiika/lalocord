import { useUserStore } from "@/entities/User"
import { UserAvatar } from "@/shared/ui/UserAvatar/UserAvatar"
import { Stack, Typography } from "@mui/material"
import {
  getRoomName,
  getRoomUsers,
} from "../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { RoomUserItem } from "./RoomUserItem/RoomUserItem"
import styles from "./RoomUsers.module.scss"
import { Tooltip } from "@mui/material"

export const RoomUsers = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const roomName = useRoomRTCStore(getRoomName)
  const localUsername = useUserStore((state) => state.localUser)

  const userList = Object.values(users)

  return (
    <div className={styles["RoomUsers"]}>
      <Stack className={styles.users} direction="row" gap={1}>
        <Tooltip title={localUsername.username || "You"} describeChild>
          <UserAvatar alt={localUsername.username || "You"} />
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
