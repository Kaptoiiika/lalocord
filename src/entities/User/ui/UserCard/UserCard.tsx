import type { PropsWithChildren } from 'react'

import { AvatarUser } from 'src/shared/ui/Avatar/AvatarUser/AvatarUser'
import { SkeletonText } from 'src/shared/ui/Skeleton'

import styles from './UserCard.module.scss'

type UserCardProps = {
  username?: string
  avatarUrl?: string
  description?: string
  placeholder?: boolean
  errorText?: string
} & PropsWithChildren

export const UserCard = (props: UserCardProps) => {
  const { username, avatarUrl, description, placeholder, errorText, children } = props

  if (placeholder) {
    return (
      <div className={`${styles.root} ${styles.placeholder}`}>
        <AvatarUser
          username=""
          avatarUrl={undefined}
          size="large"
        />
        <div className={styles.info}>
          {errorText ? (
            <div className={styles.errorText}>{errorText}</div>
          ) : (
            <>
              <div className={styles.username}>
                <SkeletonText />
              </div>
              <div className={styles.description}>
                <SkeletonText />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <AvatarUser
          username={username || ''}
          avatarUrl={avatarUrl}
          size="large"
        />
        <div className={styles.info}>
          <div className={styles.username}>{username}</div>
          {description && <div className={styles.description}>{description}</div>}
        </div>
      </div>

      <div className={styles.children}>{children}</div>
    </div>
  )
}

