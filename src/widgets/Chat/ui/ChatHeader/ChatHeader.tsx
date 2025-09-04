import { memo, useState } from 'react'

import ChatIcon from '@mui/icons-material/Chat'
import { Button, Badge, Menu, Stack } from '@mui/material'
import { useAudioEffectStore } from 'src/entities/AudioEffect'
import { AudioName } from 'src/entities/AudioEffect/model/types/AudioEffectSchema'
import { classNames } from 'src/shared/lib/classNames/classNames'

import { useChatStore } from '../../model/store/ChatStore'

import styles from './ChatHeader.module.scss'

type ChatHeaderProps = {
  handleCollapse: () => void
  collapsed: boolean
  unreadedMessage: number
}

export const ChatHeader = memo(function ChatHeader(props: ChatHeaderProps) {
  const { handleCollapse, collapsed, unreadedMessage } = props
  const audioVolumes = useAudioEffectStore((state) => state.audioSettings)
  const handleChangeMode = useAudioEffectStore((state) => state.changeMuted)
  const handleClearChat = useChatStore((state) => state.clearMessages)
  const isSilent = audioVolumes.notification.muted
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpenContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setAnchorEl(e.currentTarget)
  }

  const handleChangeSilentMode = () => {
    handleChangeMode(AudioName.notification, !isSilent)
  }

  const handleCloseContextMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <header
        className={classNames(styles.header, {
          [styles.collapsed]: collapsed,
        })}
        onContextMenu={handleOpenContextMenu}
      >
        <Button
          sx={{
            borderRadius: 0,
          }}
          className={styles.headerButton}
          onClick={handleCollapse}
          aria-label={collapsed ? 'Open chat' : 'Hide chat'}
        >
          <Badge
            color="secondary"
            badgeContent={unreadedMessage}
          >
            <ChatIcon color={isSilent ? 'disabled' : 'primary'} />
          </Badge>
        </Button>
      </header>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseContextMenu}
        keepMounted
        disablePortal
      >
        <Stack className={styles.contextMenu}>
          <Button onClick={handleChangeSilentMode}>{isSilent ? 'unmute' : 'mute'}</Button>
          <Button onClick={handleClearChat}>Clear chat history</Button>
        </Stack>
      </Menu>
    </>
  )
})
