import { useUserStore } from "@/entities/User"
import { UserAvatar } from "@/shared/ui/UserAvatar/UserAvatar"
import { Avatar, Stack, Tooltip } from "@mui/material"
import { getRoomUsers } from "../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import styles from "./RoomUsers.module.scss"

export const RoomUsers = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const localUsername = useUserStore((state) => state.localUser)

  const userList = Object.values(users)

  return (
    <div className={styles["RoomUsers"]}>
      <Stack className={styles.users} direction="row" gap={1}>
        <Tooltip title={localUsername.username || "You"}>
          <UserAvatar alt={localUsername.username || "You"} />
        </Tooltip>

        {userList.map((client) => (
          <Tooltip key={client.id} title={client.user?.username || client.id}>
            <Avatar src="" alt={client.id} />
          </Tooltip>
        ))}
      </Stack>
    </div>
  )
}
