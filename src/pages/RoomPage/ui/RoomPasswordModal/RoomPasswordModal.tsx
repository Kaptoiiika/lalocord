import { useState } from 'react'

import { Button, Modal, TextField } from 'src/shared/ui'

type RoomPasswordModalProps = {
  open: boolean
  isWrongPassword: boolean
  onSubmit: (password: string) => void
  onCancel: () => void
}

export const RoomPasswordModal = (props: RoomPasswordModalProps) => {
  const { open, isWrongPassword, onSubmit, onCancel } = props
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!password) return

    onSubmit(password)
  }

  const helperText = isWrongPassword ? 'Wrong password' : undefined

  return (
    <Modal
      open={open}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Room password</h2>
          <TextField
            required
            autoFocus
            label="Password"
            type="password"
            value={password}
            error={isWrongPassword}
            helperText={helperText}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="flex flex-row justify-end gap-1">
            <Button
              variant="secondary"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!password}
            >
              Join
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
