import type { ComponentProps } from 'react'

import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { Button } from 'src/shared/ui'

import type { RoomCreateModalProps } from './RoomCreateModal'

import { RoomCreateModal } from './RoomCreateModal'

type RoomCreateButtonProps = Pick<RoomCreateModalProps, 'onCreateRoom'> & ComponentProps<typeof Button>

export const RoomCreateButton = (props: RoomCreateButtonProps) => {
  const { children, onCreateRoom, onClick, ...otherProps } = props

  const { handleOpen, open, handleClose } = useIsOpen()

  const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
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
