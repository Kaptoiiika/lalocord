import { useState } from 'react'

import type { SelectChangeEvent } from '@mui/material'
import { Button, Dialog, MenuItem, Select } from '@mui/material'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom'

import type { WebRTCClient } from 'src/entities/WebRTC'

import styles from './TicTacToeSelectOpponent.module.scss'

type TicTacToeSelectOpponentProps = {
  open: boolean
  onClose: () => void
  onSelect?: () => void
}

export const TicTacToeSelectOpponent = (props: TicTacToeSelectOpponentProps) => {
  const { onClose, onSelect, open } = props
  const [selectedUser, setUser] = useState<WebRTCClient>()

  const handleChangeUser = (event: SelectChangeEvent<WebRTCClient>) => {
    if (typeof event.target.value === 'string') return setUser(undefined)
    setUser(event.target.value)
  }

  const { users } = useWebRTCRoomStore()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="TicTacToeSelectOpponent"
    >
      <div className={styles.TicTacToeSelectOpponent}>
        <Select
          fullWidth
          value={selectedUser || ''}
          displayEmpty
          onChange={handleChangeUser}
        >
          <MenuItem value="">
            <i>On one table</i>
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
        <Button onClick={onSelect}>Select opponent</Button>
        <Button onClick={onClose}>Cancel</Button>
      </div>
    </Dialog>
  )
}
