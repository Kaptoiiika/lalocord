import { useState } from 'react'

import { Button, CheckboxField, Modal, TextField } from 'src/shared/ui'

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

  const handleCreateRoom = (event: React.FormEvent) => {
    event.preventDefault()
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
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Create room</h2>
          <TextField
            required
            autoFocus
            autoComplete="off"
            label="Room name"
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
          />
          <CheckboxField
            label="With password"
            checked={withPassword}
            onCheckedChange={setWithPassword}
          />
          {/* type="password" заставляет менеджер паролей браузера подставлять и сохранять данные, поэтому символы скрываются через CSS */}
          {withPassword && (
            <TextField
              required
              autoComplete="off"
              label="Password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="[-webkit-text-security:disc]"
            />
          )}
          <div className="flex flex-row justify-end gap-1">
            <Button
              variant="secondary"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleCreateRoom}
              disabled={!roomName}
            >
              Create
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
