import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import { IconButton, Menu, Stack, Tooltip } from '@mui/material'
import { TicTacToePrepareGame } from 'src/features/TicTacToe'
import { useWebRTCRoomStore } from 'src/features/WebRTCRoom/model/WebRTCRoomStore'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'
import { useChatStore } from 'src/widgets/Chat/model/store/ChatStore'

import type { WebRTCMiniGameMessage } from 'src/entities/WebRTC'

export const StartMiniGame = () => {
  const { open, anchorEl, handleClose, handleOpen } = useIsOpen()
  const users = useWebRTCRoomStore((state) => state.users)

  const handleStartTicTacToe = (userId: string) => {
    const user = users.find((user) => user.id === userId)
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
    <>
      <Tooltip
        title="Settings"
        arrow
      >
        <IconButton
          aria-label="Settings"
          onClick={handleOpen}
        >
          <VideogameAssetIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Stack
          padding={1}
          gap={1}
        >
          <TicTacToePrepareGame onStart={handleStartTicTacToe}>TicTacToe</TicTacToePrepareGame>
        </Stack>
      </Menu>
    </>
  )
}
