import type { ReactNode } from 'react'

import type { ModalProps as MuiModalProps } from '@mui/material'
import { Modal as MuiModal, Paper } from '@mui/material'
import { classNames } from 'src/shared/lib/classNames'

import styles from './Modal.module.scss'

export type ModalProps = Omit<MuiModalProps, 'children' | 'onClose'> & {
  children?: ReactNode
  className?: string
  onClose?: () => void
}

export const Modal = (props: ModalProps) => {
  const { children, className, onClose } = props

  return (
    <MuiModal
      {...props}
      onClose={onClose}
    >
      <Paper className={classNames(styles.root, className)}>{children}</Paper>
    </MuiModal>
  )
}
