import { useState } from 'react'

import { Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material'
import { Modal } from 'src/shared/ui'

import type { ModalProps } from 'src/shared/ui'

export type RoomCreateModalProps = {
  onCreateRoom: (roomName: string, password?: string) => void
} & ModalProps

export const RoomCreateModal = (props: RoomCreateModalProps) => {
  const { open, onClose, onCreateRoom, ...otherProps } = props
  const [roomName, setRoomName] = useState('')
  const [withPassword, setWithPassword] = useState(false)
  const [password, setPassword] = useState('')

  const handleCancel = () => {
    onClose?.()
  }

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateRoom?.(roomName, withPassword ? password : undefined)
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      {...otherProps}
    >
      <form
        autoComplete="off"
        onSubmit={handleCreateRoom}
      >
        <Stack gap={2}>
          <Typography variant="h6">Create room</Typography>
          <TextField
            required
            autoFocus
            autoComplete="off"
            label="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={withPassword}
                onChange={(e) => setWithPassword(e.target.checked)}
              />
            }
            label="With password"
          />
          {/* type="password" заставляет менеджер паролей браузера подставлять и сохранять данные, поэтому символы скрываются через CSS */}
          {withPassword && (
            <TextField
              required
              autoComplete="off"
              label="Password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ '& input': { WebkitTextSecurity: 'disc' } }}
            />
          )}
          <Stack
            direction="row"
            gap={1}
            justifyContent="flex-end"
          >
            <Button
              color="secondary"
              variant="contained"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              onClick={handleCreateRoom}
              disabled={!roomName}
            >
              Create
            </Button>
          </Stack>
        </Stack>
      </form>
    </Modal>
  )
}
