import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { Button } from 'src/shared/ui'

import type { MessageModelNew } from '../../model/types/ChatSchema'

import { useChatStore } from '../../model/store/ChatStore'

type MessageMiniGameRequestProps = {
  data: MessageModelNew
}

export const MessageMiniGameRequest = (props: MessageMiniGameRequestProps) => {
  const { data } = props
  const { users, addMiniGame } = useWebRTCRoomStore()
  const user = users.find((roomUser) => roomUser.id === data.user.id)

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

    addMiniGame({ gameType, peer: user?.peer, id: gameId, isHost: false })
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
        <div className="flex flex-row gap-1">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleAccept}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
          >
            Declin
          </Button>
        </div>
      )}
      <div>
        {actionVariants === 'accept' && <>Starting...</>}
        {actionVariants === 'decline' && <>Declined</>}
        {actionVariants === 'waiting' && <>Waiting for opponent...</>}
      </div>
    </div>
  )
}
