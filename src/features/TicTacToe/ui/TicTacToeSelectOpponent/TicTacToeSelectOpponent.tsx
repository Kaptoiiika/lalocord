import { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import { Button, MenuItem, Select, Stack } from '@mui/material'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'
import { Modal } from 'src/shared/ui'

type TicTacToeSelectOpponentProps = {
  open: boolean
  onClose: () => void
  onSelect?: (userId: string) => void
}

export const TicTacToeSelectOpponent = (props: TicTacToeSelectOpponentProps) => {
  const { onClose, onSelect, open } = props
  const { users } = useWebRTCRoomStore()
  const [selectedUserId, setUserId] = useState<string>()

  const handleChangeUser = (event: SelectChangeEvent<string>) => {
    setUserId(event.target.value)
  }

  const handleSelect = () => {
    if (!selectedUserId) return
    onSelect?.(selectedUserId)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="TicTacToeSelectOpponent"
    >
      <Stack gap={1}>
        <Select
          fullWidth
          value={selectedUserId || ''}
          displayEmpty
          onChange={handleChangeUser}
        >
          <MenuItem value="">
            <i>Select opponent</i>
          </MenuItem>

          {Object.values(users).map((client) => (
            <MenuItem
              key={client.id}
              value={client.id}
            >
              {client.user.username}
            </MenuItem>
          ))}
        </Select>
        <Stack
          gap={1}
          direction="row"
          justifyContent="flex-end"
        >
          <Button
            color="secondary"
            variant="contained"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedUserId}
            variant="contained"
            onClick={handleSelect}
          >
            Start
          </Button>
        </Stack>
      </Stack>
    </Modal>
  )
}
