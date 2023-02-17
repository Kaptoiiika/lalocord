import { Avatar, Paper, Stack, Tooltip } from "@mui/material"
import { RTCClient } from "../../lib/RTCClient/RTCClient"
import styles from "./RoomUsers.module.scss"

type RoomUsersProps = {
  users: RTCClient[]
}

export const RoomUsers = (props: RoomUsersProps) => {
  const { users } = props
  return (
    <Paper className={styles["RoomUsers"]} variant="outlined" square>
      <Stack direction="row" gap={1}>
        {users.map((user) => (
          <Tooltip key={user.id} title={user.id}>
            <Avatar src="" alt={user.id} />
          </Tooltip>
        ))}
      </Stack>
    </Paper>
  )
}
