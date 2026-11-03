import { Gamepad2 } from 'lucide-react'
import { TicTacToePrepareGame } from 'src/features/TicTacToePrepareGame'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { IconButton, Popup } from 'src/shared/ui'
import { useChatStore } from 'src/widgets/Chat/model/store/ChatStore'

import type { WebRTCMiniGameMessage } from 'src/entities/WebRTC'

export const StartMiniGame = () => {
  const { open, setOpen, handleClose, handleOpen } = usePopup()
  const users = useWebRTCRoomStore((state) => state.users)

  const handleStartTicTacToe = (userId: string) => {
    const user = users.find((roomUser) => roomUser.id === userId)
    if (!user) return

    const id = crypto.randomUUID()
    const message: WebRTCMiniGameMessage = {
      action: 'request',
      gameId: id,
      gameType: 'TicTacToe',
    }
    user.peer.sendMiniGameRequsest(message)

    useChatStore.getState().addNewMessage({ ...message, type: 'miniGameRequest', id, action: 'waiting' }, user.user)

    handleClose()
  }

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      side="top"
      align="center"
      trigger={
        <IconButton
          tooltip="Start mini game"
          tooltipSide="top"
          aria-label="Start mini game"
          onClick={handleOpen}
        >
          <Gamepad2 />
        </IconButton>
      }
    >
      <TicTacToePrepareGame onStart={handleStartTicTacToe}>TicTacToe</TicTacToePrepareGame>
    </Popup>
  )
}
