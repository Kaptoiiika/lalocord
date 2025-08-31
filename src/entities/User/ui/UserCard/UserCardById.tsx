import { UserCard } from './UserCard'
import { useUserById } from '../../model/hooks/useUserById'

export type UserCardByIdProps = {
  userId: number
}

export const UserCardById = (props: UserCardByIdProps) => {
  const { userId } = props
  const { user, isLoading, error, textError } = useUserById(userId)

  if (isLoading) {
    return <UserCard placeholder />
  }

  if (error || !user) {
    return (
      <UserCard
        placeholder
        errorText={textError}
      />
    )
  }

  return (
    <UserCard
      username={user.username}
      avatarUrl={user.avatar}
      description={user.status}
    />
  )
}
