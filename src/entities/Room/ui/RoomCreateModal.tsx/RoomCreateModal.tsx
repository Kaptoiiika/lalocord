import { useState } from 'react'

import { Button, Stack, TextField, Typography } from '@mui/material'
import { Modal } from 'src/shared/ui'

import type { ModalProps } from 'src/shared/ui'

export type RoomCreateModalProps = {
  onCreateRoom: (roomName: string) => void
} & ModalProps

export const RoomCreateModal = (props: RoomCreateModalProps) => {
  const { open, onClose, onCreateRoom, ...otherProps } = props
  const [roomName, setRoomName] = useState('')

  const handleCancel = () => {
    onClose?.()
  }

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateRoom?.(roomName)
  }

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      {...otherProps}
    >
      <form onSubmit={handleCreateRoom}>
        <Stack gap={2}>
          <Typography variant="h6">Create room</Typography>
          <TextField
            autoFocus
            label="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
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

