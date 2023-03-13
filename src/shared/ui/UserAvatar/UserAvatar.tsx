import { FileRespounce } from "@/shared/api/types/FilteTypes"
import { Avatar, AvatarProps, Badge } from "@mui/material"
import { forwardRef } from "react"
import styles from "./UserAvatar.module.scss"
import { classNames } from "@/shared/lib/classNames/classNames"

export type UserAvatarStatus = "online" | "offline" | "idle"
type UserAvatarProps = {
  src?: string
  avatar?: FileRespounce
  status?: UserAvatarStatus
  alt: string
  className?: string
} & AvatarProps

export const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  function UserAvatar(props, ref) {
    const { src, avatar, status, alt, className, ...other } = props

    const imageSRC = avatar?.formats?.thumbnail?.url || avatar?.url || src

    return (
      <Badge
        className={classNames(styles.badgeStatus, {
          [styles.red]: status === "offline",
          [styles.yellow]: status === "idle",
          [styles.green]: status === "online",
        })}
        overlap="circular"
      >
        <Avatar
          className={className}
          ref={ref}
          src={imageSRC}
          alt={alt}
          {...other}
        />
      </Badge>
    )
  }
)
