import { useRoomScreenWakeLock, useWebRTCRoom } from 'src/features/WebRTCRoom'
import { Chat } from 'src/widgets/Chat'
import { RoomStreams } from 'src/widgets/RoomStream'

import { RoomActions } from '../RoomActions/RoomActions'
import { RoomIsFull } from '../RoomIsFull/RoomIsFull'
import { RoomUsers } from '../RoomUsers/RoomUsers'

type RoomLobbyProps = {
  isFull?: boolean
}

export const RoomLobby = (props: RoomLobbyProps) => {
  const { isFull } = props
  const { handleSendMessage, handleSendFile } = useWebRTCRoom()
  useRoomScreenWakeLock()

  if (isFull) {
    return <RoomIsFull />
  }

  return (
    <div className="flex h-full flex-row justify-between max-[625px]:flex-col">
      <div className="relative flex h-full w-full flex-col max-[625px]:overflow-auto">
        <RoomUsers />
        <RoomStreams />
        <RoomActions />
      </div>

      <Chat
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
      />
    </div>
  )
}
