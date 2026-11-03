import { useLocalUserStore, UserCard } from 'src/entities/User'
import { useWebRTCStore } from 'src/entities/WebRTC'
import { VolumeMeter } from 'src/features/VolumeMetter/ui/VolumeMeter'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { AvatarUser, IconButton, Popup, Tooltip } from 'src/shared/ui'

import { RoomUserItem } from './RoomUserItem/RoomUserItem'

export const RoomUsers = () => {
  const users = useWebRTCRoomStore((state) => state.users)
  const roomName = useWebRTCRoomStore((state) => state.roomId)
  const microphoneStream = useWebRTCStore((state) => state.streams.mic)
  const localUsername = useLocalUserStore((state) => state.localUser)
  const { open, setOpen, handleOpen } = usePopup()
  const userList = Object.values(users)
  const username = localUsername.username || 'You'

  return (
    <div className="flex h-[var(--header-height)] shrink-0 items-center [border-bottom:var(--box-border)]">
      <div className="mx-2 flex flex-row items-center gap-1">
        <Popup
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          align="start"
          className="w-auto bg-transparent p-0 shadow-none ring-0"
          trigger={
            <IconButton
              className="size-auto p-0"
              onContextMenu={handleOpen}
              onClick={handleOpen}
              aria-label={username}
            >
              <Tooltip
                title={username}
                side="bottom"
              >
                <div className="relative">
                  <AvatarUser
                    borderColor={microphoneStream?.active ? 'green' : 'grey'}
                    username={username}
                    avatarUrl={localUsername.avatar}
                    size="small"
                  />
                  {microphoneStream && <VolumeMeter stream={microphoneStream} />}
                </div>
              </Tooltip>
            </IconButton>
          }
        >
          <UserCard
            username={username}
            avatarUrl={localUsername.avatar}
          />
        </Popup>

        {userList.map((user) => (
          <RoomUserItem
            key={user.id}
            user={user}
          />
        ))}
      </div>
      <div className="flex h-full w-full items-center justify-center [border-left:var(--box-border)]">
        <p className="text-lg font-semibold">{roomName}</p>
      </div>
    </div>
  )
}
