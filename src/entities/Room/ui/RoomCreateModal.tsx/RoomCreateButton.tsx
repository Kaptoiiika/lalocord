import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'

import type { RoomCreateModalProps } from './RoomCreateModal'

import { RoomCreateModal } from './RoomCreateModal'

type RoomCreateButtonProps = Pick<RoomCreateModalProps, 'onCreateRoom'> & ButtonProps

export const RoomCreateButton = (props: RoomCreateButtonProps) => {
  const { children, onCreateRoom, onClick, ...otherProps } = props

  const { handleOpen, open, handleClose } = useIsOpen()

  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    handleOpen()
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        {...otherProps}
      >
        {children}
      </Button>
      <RoomCreateModal
        open={open}
        onClose={handleClose}
        onCreateRoom={onCreateRoom}
      />
    </>
  )
}
