import { Button, Stack } from '@mui/material'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'

import type { MessageModelNew } from '../../model/types/ChatSchema'

import { useChatStore } from '../../model/store/ChatStore'

type MessageMiniGameRequestProps = {
  data: MessageModelNew
}

export const MessageMiniGameRequest = (props: MessageMiniGameRequestProps) => {
  const { data } = props
  const { users, addMiniGame } = useWebRTCRoomStore()
  const user = users.find((user) => user.id === data.user.id)

  const gameType = data.message.gameType
  const gameId = data.message.gameId
  const actionVariants = data.message.action

  const handleAccept = () => {
    if (!gameType || !gameId || !user?.peer) return
    user?.peer.sendMiniGameRequsest({
      action: 'accept',
      gameId,
      gameType,
    })
    useChatStore.getState().addNewMessage({ ...data.message, action: 'accept' }, data.user)

    addMiniGame(gameType, user?.peer)
  }

  const handleDecline = () => {
    if (!gameType || !gameId) return
    user?.peer.sendMiniGameRequsest({
      action: 'decline',
      gameId,
      gameType,
    })
    useChatStore.getState().addNewMessage({ ...data.message, action: 'decline' }, data.user)
  }

  return (
    <div>
      <b>Request to play</b> <i>{gameType}</i>
      {actionVariants === 'request' && (
        <Stack
          direction="row"
          gap={1}
        >
          <Button
            fullWidth
            onClick={handleAccept}
          >
            Accept
          </Button>
          <Button
            fullWidth
            onClick={handleDecline}
          >
            Declin
          </Button>
        </Stack>
      )}
      <div>
        {actionVariants === 'accept' && <>Starting...</>}
        {actionVariants === 'decline' && <>Declined</>}
        {actionVariants === 'waiting' && <>Waiting for opponent...</>}
      </div>
    </div>
  )
}

