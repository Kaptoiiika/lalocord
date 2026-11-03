import { useState } from 'react'

import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { AvatarUser, Button, IconButton, Modal, TextField } from 'src/shared/ui'

import { useLocalUserStore } from '../../model/store/LocalUserStore'

export const UserChangeAvatar = () => {
  const { setLocalAvatar, localUser } = useLocalUserStore()
  const srcAvatar = localUser.avatar ?? ''
  const [testSrc, setTestSrc] = useState(srcAvatar)
  const [tempSrc, setTempSrc] = useState(srcAvatar)
  const [syncedSrcAvatar, setSyncedSrcAvatar] = useState(srcAvatar)
  const { open, handleOpen, handleClose: handleCloseModal } = useIsOpen()

  if (srcAvatar !== syncedSrcAvatar) {
    setSyncedSrcAvatar(srcAvatar)
    setTestSrc(srcAvatar)
    setTempSrc(srcAvatar)
  }

  const handleChangeAvatar = (src: string) => {
    setLocalAvatar(src)
  }

  const handleChangeSrc = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempSrc(event.currentTarget.value)
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
        className="size-auto p-0"
        onClick={handleOpen}
        aria-label="change avatar"
      >
        <AvatarUser
          username={localUser.username}
          avatarUrl={localUser.avatar}
          size="medium"
        />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-1">
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
          </div>

          <div className="flex flex-row gap-1">
            <Button
              variant="outline"
              onClick={handleTest}
            >
              Test
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button onClick={handleAccept}>Accept</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
