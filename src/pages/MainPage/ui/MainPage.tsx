import { RoomList } from "@/entities/Room"
import { useUserStore } from "@/entities/User"
import { AppFooter } from "@/widgets/Footer"
import { PageWrapper } from "@/widgets/Page"
import { Link, Stack, TextField, Typography } from "@mui/material"
import styles from "./MainPage.module.scss"

export const MainPage = () => {
  const { setLocalUsername, localUser } = useUserStore()
  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUsername(e.currentTarget.value)
  }

  return (
    <PageWrapper component="div" className={styles.mainPage}>
      <Stack
        justifyContent="space-between"
        direction="row"
        component="main"
        gap={1}
        margin={1}
        height={"100%"}
      >
        <Stack direction="column" alignItems="start" gap={1}>
          <TextField
            variant="outlined"
            value={localUser.username}
            label="username"
            type="text"
            onChange={handleChangeUserName}
          />
          <RoomList />
        </Stack>
        {!__IS_ELECTRON__ && (
          <Typography className={styles.releaseLink}>
            <Link
              href="https://github.com/Kaptoiiika/RipCornd/releases/latest"
              target="_blank"
              rel="noreferrer"
            >
              Download windows app
            </Link>
          </Typography>
        )}
      </Stack>

      <AppFooter />
    </PageWrapper>
  )
}
