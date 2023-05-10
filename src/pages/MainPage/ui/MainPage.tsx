import { RoomList } from "@/entities/Room"
import { useUserStore } from "@/entities/User"
import { AppFooter } from "@/widgets/Footer"
import { PageWrapper } from "@/widgets/Page"
import { Stack, TextField } from "@mui/material"
import styles from "./MainPage.module.scss"

export const MainPage = () => {
  const { setLocalUsername, localUser } = useUserStore()
  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUsername(e.currentTarget.value)
  }

  return (
    <PageWrapper component="div" className={styles.mainPage}>
      <Stack
        component="main"
        direction="column"
        gap={1}
        margin={1}
        alignItems="start"
      >
        <TextField
          variant="outlined"
          value={localUser.username}
          label="username"
          type="text"
          onChange={handleChangeUserName}
        />
        <RoomList />
      </Stack>

      <AppFooter />
    </PageWrapper>
  )
}
