import { Avatar, Stack, Tooltip } from "@mui/material"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import styles from "./RoomUsers.module.scss"

type RoomUsersProps = {
  users: RTCClient[]
}

export const RoomUsers = (props: RoomUsersProps) => {
  const { users } = props
  return (
    <div className={styles["RoomUsers"]}>
      <Stack className={styles.users} direction="row" gap={1}>
        <Tooltip title={"You"}>
          <Avatar src="" alt={"You"} />
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
