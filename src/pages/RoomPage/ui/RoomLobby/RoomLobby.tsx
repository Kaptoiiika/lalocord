import { Stack } from '@mui/material'
import { useWebRTCRoom } from 'src/features/WebRTCRoom'
import { Chat } from 'src/widgets/Chat'
import { RoomStreams } from 'src/widgets/RoomStream'

import { RoomActions } from '../RoomActions/RoomActions'
import { RoomIsFull } from '../RoomIsFull/RoomIsFull'
import { RoomUsers } from '../RoomUsers/RoomUsers'

import styles from './RoomLobby.module.scss'

type RoomLobbyProps = {
  isFull?: boolean
}

export const RoomLobby = (props: RoomLobbyProps) => {
  const { isFull } = props
  const { handleSendMessage, handleSendFile } = useWebRTCRoom()

  if (isFull) {
    return <RoomIsFull />
  }

  return (
    <Stack
      className={styles.lobby}
      justifyContent="space-between"
      height="100%"
    >
      <div className={styles.mainScreen}>
        <RoomUsers />
        <RoomStreams />
        <RoomActions />
      </div>

      <Chat
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
      />
    </Stack>
  )
}
