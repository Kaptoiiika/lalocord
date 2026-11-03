import { cn } from 'src/shared/lib/utils/cn'

import { AvatarUser, type AvatarUserProps } from '../AvatarUser'

export type AvatarUserWithBadgeStatus = 'online' | 'offline' | 'idle'

type AvatarUserWithBadgeProps = {
  status?: AvatarUserWithBadgeStatus
} & AvatarUserProps

const statusClassName: Record<AvatarUserWithBadgeStatus, string> = {
  offline: 'bg-[var(--color-red)]',
  idle: 'bg-[var(--color-yellow)]',
  online: 'bg-[var(--color-green)]',
}

export const AvatarUserWithBadge = (props: AvatarUserWithBadgeProps) => {
  const { status, ...other } = props

  return (
    <span className="relative inline-flex">
      <AvatarUser {...other} />
      {status && (
        <span
          className={cn(
            'absolute right-px bottom-px z-[3] size-2 rounded-full border border-[var(--box-border-color)]',
            statusClassName[status]
          )}
        />
      )}
    </span>
  )
}
