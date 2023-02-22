import { FileRespounce } from "@/shared/api/types/FilteTypes"
import { Avatar, AvatarProps } from "@mui/material"
import { forwardRef } from "react"

type UserAvatarProps = {
  src?: string
  avatar?: FileRespounce
  alt: string
} & AvatarProps

export const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  function UserAvatar(props, ref) {
    const { src, avatar, ...other } = props

    const imageSRC = avatar?.formats?.thumbnail?.url || avatar?.url || src

    return <Avatar ref={ref} src={imageSRC} {...other} />
  }
)
