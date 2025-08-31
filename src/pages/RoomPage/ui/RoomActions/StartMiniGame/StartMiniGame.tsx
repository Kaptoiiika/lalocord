import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import { IconButton, Menu, Stack, Tooltip } from '@mui/material'
import { TicTacToePrepareGame } from 'src/features/TicTacToe'
import { useIsOpen } from 'src/shared/lib/hooks/useIsOpen/useIsOpen'

export const StartMiniGame = () => {
  const { open, anchorEl, handleClose, handleOpen } = useIsOpen()

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
          <TicTacToePrepareGame onStart={handleClose}>TicTacToe</TicTacToePrepareGame>
        </Stack>
      </Menu>
    </>
  )
}
