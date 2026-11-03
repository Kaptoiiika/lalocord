import { useNavigate } from 'react-router-dom'

import { RoomList } from 'src/entities/Room'
import { RoomCreateButton } from 'src/entities/Room/ui/RoomCreateModal.tsx/RoomCreateButton'
import { useLocalUserStore } from 'src/entities/User'
import { ThemeBackground } from 'src/features/ThemeBackground'
import { AppRoutes } from 'src/shared/config'
import { __IS_ELECTRON__ } from 'src/shared/const/config'
import { TextField, TextLink } from 'src/shared/ui'
import { AppFooter } from 'src/widgets/Footer'
import { PageWrapper } from 'src/widgets/Page'

export const MainPage = () => {
  const { setLocalUsername, localUser } = useLocalUserStore()
  const navigate = useNavigate()
  const handleChangeUserName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUsername(event.currentTarget.value)
  }

  const handleCreateRoom = (roomName: string, password?: string) => {
    navigate(AppRoutes.ROOM_ID.replace(':id', roomName), {
      state: { password },
    })
  }

  const handleNavigateToGame = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    navigate(AppRoutes.GAME)
  }

  return (
    <PageWrapper
      component="div"
      className="flex w-full flex-col justify-between overflow-auto"
    >
      <main className="m-2 flex h-full flex-col justify-between gap-1">
        <ThemeBackground />
        <div className="flex flex-col items-start gap-1">
          <div className="flex flex-row gap-1">
            <TextField
              value={localUser.username}
              label="Username"
              type="text"
              onChange={handleChangeUserName}
            />
          </div>

          <RoomCreateButton onCreateRoom={handleCreateRoom}>Create Room</RoomCreateButton>
          <RoomList />
        </div>

        <div className="flex flex-col items-end gap-1">
          <TextLink
            onClick={handleNavigateToGame}
            href={AppRoutes.GAME}
          >
            Tic Tac Toe
          </TextLink>
          {!__IS_ELECTRON__ && (
            <TextLink
              href="https://github.com/Kaptoiiika/lalocord/releases/latest"
              target="_blank"
              rel="noreferrer"
            >
              Download windows app
            </TextLink>
          )}
        </div>
      </main>

      <AppFooter />
    </PageWrapper>
  )
}
