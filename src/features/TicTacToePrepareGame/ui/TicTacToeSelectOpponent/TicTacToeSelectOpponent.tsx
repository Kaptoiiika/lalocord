import { useState } from 'react'

import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { Button, Modal, SelectField } from 'src/shared/ui'

type TicTacToeSelectOpponentProps = {
  open: boolean
  onClose: () => void
  onSelect?: (userId: string) => void
}

export const TicTacToeSelectOpponent = (props: TicTacToeSelectOpponentProps) => {
  const { onClose, onSelect, open } = props
  const { users } = useWebRTCRoomStore()
  const [selectedUserId, setUserId] = useState<string>()

  const handleSelect = () => {
    if (!selectedUserId) return
    onSelect?.(selectedUserId)
    onClose()
  }

  const options = users
    .filter((client) => client.id)
    .map((client) => ({
      value: client.id,
      label: client.user.username || client.id,
    }))

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col gap-1">
        <SelectField
          placeholder="Select opponent"
          value={selectedUserId}
          onValueChange={setUserId}
          options={options}
        />
        <div className="flex flex-row justify-end gap-1">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedUserId}
            onClick={handleSelect}
          >
            Start
          </Button>
        </div>
      </div>
    </Modal>
  )
}
