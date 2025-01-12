import { IconButton, Menu, Stack, Tooltip } from "@mui/material"
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset"
import { useIsOpen } from "@/shared/lib/hooks/useIsOpen/useIsOpen"
import { TicTacToePrepareGame } from "@/features/TicTacToe"

export const StartMiniGame = () => {
  const { open, anchorEl, handleClose, handleOpen } = useIsOpen()

  return (
    <>
      <Tooltip title="Settings" arrow>
        <IconButton aria-label={"Settings"} onClick={handleOpen}>
          <VideogameAssetIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Stack padding={1} gap={1}>
          <TicTacToePrepareGame onStart={handleClose}>
            TicTacToe
          </TicTacToePrepareGame>
        </Stack>
      </Menu>
    </>
  )
}
