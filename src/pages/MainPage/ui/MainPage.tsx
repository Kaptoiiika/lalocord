import { RoomList } from "@/entities/Room"
import { useUserStore } from "@/entities/User"
import { PageWrapper } from "@/widgets/Page"
import { Stack, TextField } from "@mui/material"
import styles from "./MainPage.module.scss"

export const MainPage = () => {
  const { setUsername, localUser } = useUserStore()
  const hundleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value)
  }

  return (
    <PageWrapper className={styles.mainPage}>
      <Stack direction="column" gap={1} alignItems="start">
        <TextField
          variant="outlined"
          value={localUser.username}
          label="username"
          onChange={hundleChangeUserName}
        />
        <RoomList />
      </Stack>
    </PageWrapper>
  )
}
