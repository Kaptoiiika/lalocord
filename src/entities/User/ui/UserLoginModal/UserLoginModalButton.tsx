import type { ComponentProps } from 'react'

import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { Button } from 'src/shared/ui'

import { UserLoginModal } from './UserLoginModal'

type UserLoginModalButtonProps = ComponentProps<typeof Button>

export const UserLoginModalButton = (props: UserLoginModalButtonProps) => {
  const { children, onClick, ...otherProps } = props

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
      <UserLoginModal
        isOpen={open}
        onClose={handleClose}
      />
    </>
  )
}
