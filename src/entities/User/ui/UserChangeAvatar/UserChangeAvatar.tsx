import { useEffect, useState } from 'react'

import { Button, Dialog, IconButton, Paper, Stack, TextField } from '@mui/material'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { AvatarUser } from 'src/shared/ui/Avatar'

import { useLocalUserStore } from '../../model/store/LocalUserStore'

export const UserChangeAvatar = () => {
  const { setLocalAvatar, localUser } = useLocalUserStore()
  const srcAvatar = localUser.avatar ?? ''
  const [testSrc, setTestSrc] = useState(srcAvatar)
  const [tempSrc, setTempSrc] = useState(srcAvatar)
  const { open, handleOpen, handleClose: handleCloseModal } = useIsOpen()

  useEffect(() => {
    setTestSrc(srcAvatar)
    setTempSrc(srcAvatar)
  }, [srcAvatar])

  const handleChangeAvatar = (src: string) => {
    setLocalAvatar(src)
  }

  const handleChangeSrc = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSrc(e.currentTarget.value)
  }

  const handleTest = () => {
    setTestSrc(tempSrc)
  }

  const handleClose = () => {
    setTestSrc(srcAvatar)
    setTempSrc(srcAvatar)
    handleCloseModal()
  }

  const handleAccept = () => {
    handleChangeAvatar(tempSrc)
    handleCloseModal()
  }

  return (
    <>
      <IconButton
        sx={{
          p: 0,
        }}
        onClick={handleOpen}
        aria-label="change avatar"
      >
        <AvatarUser
          username={localUser.username}
          avatarUrl={localUser.avatar}
          size="medium"
        />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
      >
        <Paper
          sx={{
            p: 1,
          }}
        >
          <Stack gap={1}>
            <Stack
              direction="row"
              gap={1}
              alignItems="center"
            >
              <AvatarUser
                username={localUser.username}
                avatarUrl={testSrc}
                size="medium"
              />
              <TextField
                placeholder="image src"
                value={tempSrc}
                onChange={handleChangeSrc}
              />
            </Stack>

            <Stack
              direction="row"
              gap={1}
            >
              <Button
                variant="outlined"
                onClick={handleTest}
              >
                Test
              </Button>
              <Button
                variant="outlined"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAccept}
              >
                Accept
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Dialog>
    </>
  )
}
