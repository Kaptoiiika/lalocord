import { memo } from 'react'

import { Lock, Users } from 'lucide-react'
import { apiClient } from 'src/shared/api/apiClient'
import { AppRoutes } from 'src/shared/config'
import { Badge, Card, Skeleton } from 'src/shared/ui'
import { Link } from 'src/shared/ui/Link/Link'
import useSWR from 'swr'

import type { RoomModel } from '../../model/types/RoomSchema'

const fetcher = async (url: string) => {
  const res = await apiClient(url)

  return res.data
}

const roomCardFrameClassName = 'max-w-100 gap-2 border border-foreground/20 p-3 ring-0'
const roomCardClassName = `${roomCardFrameClassName} transition-colors hover:bg-foreground/10`

const roomListSkeletonIds = ['first', 'second', 'third']

const RoomListItem = (props: { room: RoomModel }) => {
  const { room } = props
  const participants = room.userList ?? []
  const participantCount = participants.length
  const hasParticipants = participantCount > 0
  const isPrivate = !!room.hasPassword
  const participantNames = participants.map((user) => user.username).join(', ')

  return (
    <Link
      className="block w-full max-w-100 rounded-xl focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      to={AppRoutes.ROOM_ID.replace(':id', room.name)}
    >
      <Card className={roomCardClassName}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {isPrivate && <Lock className="size-4 shrink-0 text-muted-foreground" />}
            <span className="truncate font-medium text-foreground">{room.name}</span>
            {isPrivate && <span className="sr-only">Private room</span>}
          </div>
          <Badge
            variant="secondary"
            aria-label={`${participantCount} participants`}
          >
            <Users />
            {participantCount}
          </Badge>
        </div>
        {hasParticipants && <p className="truncate text-sm text-muted-foreground">{participantNames}</p>}
      </Card>
    </Link>
  )
}

const RoomListSkeleton = () => (
  <>
    {roomListSkeletonIds.map((skeletonId) => (
      <Card
        key={skeletonId}
        className={roomCardFrameClassName}
      >
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-56 max-w-full" />
      </Card>
    ))}
  </>
)

export const RoomList = memo(function RoomList() {
  const { data, isLoading } = useSWR<RoomModel[]>('/room', fetcher, {
    refreshInterval: 5000,
  })

  const roomList = Array.isArray(data) ? data : []

  const roomListIsEmpty = roomList.length === 0 && !isLoading

  return (
    <div className="flex w-full flex-col gap-2 overflow-auto">
      <h2 className="text-base font-semibold text-foreground">Open rooms</h2>
      <div className="flex w-full flex-col gap-2">
        {roomList.map((room) => (
          <RoomListItem
            key={room.id}
            room={room}
          />
        ))}
        {roomListIsEmpty && <p className="py-6 text-center text-sm text-muted-foreground">No open rooms</p>}
        {isLoading && <RoomListSkeleton />}
      </div>
    </div>
  )
})
