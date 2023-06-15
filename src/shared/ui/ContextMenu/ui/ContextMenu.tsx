import { ContentCopy } from "@mui/icons-material"
import {
  MenuList,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Menu,
  MenuProps,
} from "@mui/material"

type ContextMenuProps = {
  imageToCopy?: Blob | string
  onClose: () => void
  open: boolean
  anchorEl?: Element
} & MenuProps

export const ContextMenu = (props: ContextMenuProps) => {
  const { imageToCopy, onClose, open, ...menuProps } = props

  const handleCopyImage = async () => {
    if (!imageToCopy) return
    if (typeof imageToCopy === "string") {
      const data = await fetch(imageToCopy)
      const blob = data.blob()
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
    } else {
      navigator.clipboard.write([
        new ClipboardItem({ "image/png": imageToCopy }),
      ])
    }
    onClose?.()
  }

  return (
    <Menu
      anchorReference="anchorPosition"
      open={!!open}
      onClose={onClose}
      {...menuProps}
    >
      <MenuList>
        {imageToCopy && (
          <MenuItem onClick={handleCopyImage}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy image</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}
