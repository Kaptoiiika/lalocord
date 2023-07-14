import { Button, Badge } from "@mui/material"
import styles from "./ChatHeader.module.scss"
import ChatIcon from "@mui/icons-material/Chat"
import { classNames } from "@/shared/lib/classNames/classNames"
import { memo } from "react"
import { useAudioEffectStore } from "@/entities/AudioEffect"
import { AudioName } from "@/entities/AudioEffect/model/types/AudioEffectSchema"

type ChatHeaderProps = {
  handleCollapse: () => void
  collapsed: boolean
  unreadedMessage: number
}

export const ChatHeader = memo(function ChatHeader(props: ChatHeaderProps) {
  const { handleCollapse, collapsed, unreadedMessage } = props
  const audioVolumes = useAudioEffectStore((state) => state.audioSettings)
  const handleChangeMode = useAudioEffectStore((state) => state.changeMuted)
  const isSilent = audioVolumes.notification.muted

  const handleOpenContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    handleChangeMode(AudioName.notification, !isSilent)
  }

  return (
    <header
      className={classNames(styles.header, {
        [styles.collapsed]: collapsed,
      })}
      onContextMenu={handleOpenContextMenu}
    >
      <Button
        sx={{ borderRadius: 0 }}
        className={styles.headerButton}
        onClick={handleCollapse}
        aria-label={collapsed ? "Open chat" : "Hide chat"}
      >
        <Badge color="secondary" badgeContent={unreadedMessage}>
          <ChatIcon color={isSilent ? "disabled" : "primary"} />
        </Badge>
      </Button>
    </header>
  )
})
