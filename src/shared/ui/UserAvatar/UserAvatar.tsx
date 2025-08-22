import type { AvatarProps } from '@mui/material';
import { Avatar, Badge } from '@mui/material';
import { classNames } from 'src/shared/lib/classNames/classNames';

import type { FileRespounce } from 'src/shared/api/types/FilteTypes';

import styles from './UserAvatar.module.scss';


export type UserAvatarStatus = 'online' | 'offline' | 'idle';
type UserAvatarProps = {
  src?: string;
  avatar?: FileRespounce;
  status?: UserAvatarStatus;
  alt: string;
  className?: string;
  micOnline?: boolean;
} & AvatarProps;

export const UserAvatar = (props: UserAvatarProps) => {
  const { src, avatar, status, alt, className, micOnline, ...other } = props;

  const imageSRC = avatar?.formats?.thumbnail?.url || avatar?.url || src;

  return (
    <Badge
      className={classNames(styles.badgeStatus, {
        [styles.red]: status === 'offline',
        [styles.yellow]: status === 'idle',
        [styles.green]: status === 'online',
      })}
      overlap="circular"
    >
      <Avatar
        className={classNames(className, {
          [styles.micOnline]: micOnline,
          [styles.micOffline]: !micOnline,
        })}
        src={imageSRC}
        alt={alt}
        {...other}
      />
    </Badge>
  );
};
