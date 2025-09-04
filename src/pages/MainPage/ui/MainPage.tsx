import { useNavigate } from 'react-router-dom'

import { Link as MuiLink, Stack, TextField } from '@mui/material'
import { RoomList } from 'src/entities/Room'
import { RoomCreateButton } from 'src/entities/Room/ui/RoomCreateModal.tsx/RoomCreateButton'
import { useLocalUserStore } from 'src/entities/User'
import { AppRoutes } from 'src/shared/config'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { AppFooter } from 'src/widgets/Footer'
import { PageWrapper } from 'src/widgets/Page'

import styles from './MainPage.module.scss'

export const MainPage = () => {
  const { setLocalUsername, localUser } = useLocalUserStore()
  const navigate = useNavigate()
  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUsername(e.currentTarget.value)
  }

  const handleCreateRoom = async (roomName: string) => {
    navigate(AppRoutes.ROOM_ID.replace(':id', roomName))
  }

  const handleNavigateToGame = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate(AppRoutes.GAME)
  }

  return (
    <PageWrapper
      component="div"
      className={styles.mainPage}
    >
      <Stack
        justifyContent="space-between"
        component="main"
        gap={1}
        margin={1}
        height="100%"
        direction="column"
      >
        <Stack
          direction="column"
          alignItems="start"
          gap={1}
        >
          <Stack
            gap={1}
            direction="row"
          >
            <TextField
              variant="outlined"
              value={localUser.username}
              label="Username"
              type="text"
              onChange={handleChangeUserName}
            />
            {/* <UserLoginModalButton>Login</UserLoginModalButton> */}
          </Stack>

          <RoomCreateButton
            variant="contained"
            onCreateRoom={handleCreateRoom}
          >
            Create Room
          </RoomCreateButton>
          <RoomList />
        </Stack>

        <Stack
          gap={1}
          alignItems="end"
        >
          <MuiLink
            onClick={handleNavigateToGame}
            href={AppRoutes.GAME}
          >
            Tic Tac Toe
          </MuiLink>
          {!__IS_ELECTRON__ && (
            <MuiLink
              href="https://github.com/Kaptoiiika/lalocord/releases/latest"
              target="_blank"
              rel="noreferrer"
            >
              Download windows app
            </MuiLink>
          )}
        </Stack>
      </Stack>

      <AppFooter />
    </PageWrapper>
  )
}
