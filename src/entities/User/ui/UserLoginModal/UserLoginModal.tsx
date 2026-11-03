import { useState } from 'react'

import { Button, Modal, TextField } from 'src/shared/ui'

interface UserLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UserLoginModal = (props: UserLoginModalProps) => {
  const { isOpen, onClose } = props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
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
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Вход в аккаунт</h2>
          <TextField
            autoFocus
            label="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <TextField
            label="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <div className="flex flex-row justify-end gap-1">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button type="submit">Войти</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
