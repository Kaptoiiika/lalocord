import { useUserStore } from "@/entities/User"
import { UserAvatar } from "@/shared/ui/UserAvatar/UserAvatar"
import { Stack } from "@mui/material"
import { getRoomUsers } from "../../model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { RoomUserItem } from "./RoomUserItem/RoomUserItem"
import styles from "./RoomUsers.module.scss"

export const RoomUsers = () => {
  const users = useRoomRTCStore(getRoomUsers)
  const localUsername = useUserStore((state) => state.localUser)

  const userList = Object.values(users)

  return (
    <div className={styles["RoomUsers"]}>
      <Stack className={styles.users} direction="row" gap={1}>
        <UserAvatar alt={localUsername.username || "You"} />

        {userList.map((client) => (
          <RoomUserItem key={client.id} client={client} />
        ))}
      </Stack>
    </div>
  )
}
