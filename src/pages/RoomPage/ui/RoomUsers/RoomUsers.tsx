import { getAuthData } from "@/entities/User"
import { UserAvatar } from "@/shared/ui/UserAvatar/UserAvatar"
import { Avatar, Stack, Tooltip } from "@mui/material"
import { useSelector } from "react-redux"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import styles from "./RoomUsers.module.scss"

type RoomUsersProps = {
  users: RTCClient[]
}

export const RoomUsers = (props: RoomUsersProps) => {
  const { users } = props
  const authUser = useSelector(getAuthData)

  return (
    <div className={styles["RoomUsers"]}>
      <Stack className={styles.users} direction="row" gap={1}>
        <Tooltip title={authUser?.username ?? "You"}>
          <UserAvatar
            avatar={authUser?.avatar}
            alt={authUser?.username || "You"}
          />
        </Tooltip>

        {users.map((user) => (
          <Tooltip key={user.id} title={user.id}>
            <Avatar src="" alt={user.id} />
          </Tooltip>
        ))}
      </Stack>
    </div>
  )
}
