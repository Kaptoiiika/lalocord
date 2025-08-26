import { Badge } from '@mui/material'
import { classNames } from 'src/shared/lib/classNames/classNames'

import { AvatarUser, type AvatarUserProps } from '../AvatarUser'

import styles from './AvatarUserWithBadge.module.scss'

export type AvatarUserWithBadgeStatus = 'online' | 'offline' | 'idle'

type AvatarUserWithBadgeProps = {
  status?: AvatarUserWithBadgeStatus
} & AvatarUserProps

export const AvatarUserWithBadge = (props: AvatarUserWithBadgeProps) => {
  const { status, ...other } = props

  return (
    <Badge
      className={classNames(styles.badgeStatus, {
        [styles.red]: status === 'offline',
        [styles.yellow]: status === 'idle',
        [styles.green]: status === 'online',
      })}
      overlap="circular"
    >
      <AvatarUser {...other} />
    </Badge>
  )
}

