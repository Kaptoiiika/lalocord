import { useState } from 'react'

import { classNames } from 'src/shared/lib/classNames'
import { getInitials } from 'src/shared/lib/utils/String'

import styles from './AvatarUser.module.scss'

export type AvatarSize = 'small' | 'medium' | 'large'
export type AvatarBorderColor = 'grey' | 'green' | 'red'

export type AvatarUserProps = {
  username: string
  avatarUrl?: string
  size?: AvatarSize
  borderColor?: AvatarBorderColor
}

const sizeClassMap: Record<AvatarSize, string> = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
}

const borderColorClassMap: Record<AvatarBorderColor, string> = {
  grey: styles.borderGrey,
  green: styles.borderGreen,
  red: styles.borderRed,
}

export const AvatarUser = (props: AvatarUserProps) => {
  const { username, avatarUrl, size = 'medium', borderColor = 'grey' } = props
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const showImg = avatarUrl && !imgError && imgLoaded

  return (
    <div className={classNames(styles.root, sizeClassMap[size], borderColorClassMap[borderColor])}>
      {avatarUrl && !imgError && (
        <img
          src={avatarUrl}
          alt={`Аватар пользователя ${username}`}
          className={classNames(styles.avatar, { [styles.visible]: showImg, [styles.hidden]: !showImg })}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}
      <div
        className={classNames(styles.placeholder)}
        aria-label={`Плейсхолдер аватара для пользователя ${username}`}
      >
        {getInitials(username)}
      </div>
    </div>
  )
}

