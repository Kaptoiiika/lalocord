import { useState } from 'react'

import { Button, Stack, TextField, Typography } from '@mui/material'
import { Modal } from 'src/shared/ui'

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

  return (
    <Modal
      open={open}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={2}>
          <Typography variant="h6">Room password</Typography>
          <TextField
            required
            autoFocus
            label="Password"
            type="password"
            value={password}
            error={isWrongPassword}
            helperText={isWrongPassword ? 'Wrong password' : undefined}
            onChange={(event) => setPassword(event.target.value)}
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
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!password}
            >
              Join
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  )
}
