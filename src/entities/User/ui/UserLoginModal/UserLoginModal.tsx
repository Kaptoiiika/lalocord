import { useState } from 'react'

import { Button, Stack, TextField, Typography } from '@mui/material'
import { Modal } from 'src/shared/ui'

interface UserLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UserLoginModal = (props: UserLoginModalProps) => {
  const { isOpen, onClose } = props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // onLogin(username, password)
  }

  if (!isOpen) {
    return null
  }

  return (
    <Modal
      open
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={1}>
          <Typography variant="h6">Вход в аккаунт</Typography>
          <TextField
            autoFocus
            label="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Stack
            direction="row"
            gap={1}
            justifyContent="flex-end"
          >
            <Button
              color="secondary"
              variant="contained"
              type="button"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              type="submit"
            >
              Войти
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  )
}

