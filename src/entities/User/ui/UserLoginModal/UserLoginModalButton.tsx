import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'

import { UserLoginModal } from './UserLoginModal'

type UserLoginModalButtonProps = ButtonProps

export const UserLoginModalButton = (props: UserLoginModalButtonProps) => {
  const { children, onClick, ...otherProps } = props

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
      <UserLoginModal
        isOpen={open}
        onClose={handleClose}
      />
    </>
  )
}

