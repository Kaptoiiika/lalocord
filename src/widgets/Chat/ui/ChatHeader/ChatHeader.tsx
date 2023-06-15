import { Button, Badge } from "@mui/material"
import styles from "./ChatHeader.module.scss"
import ChatIcon from "@mui/icons-material/Chat"
import { classNames } from "@/shared/lib/classNames/classNames"
import { memo } from "react"
import { useChatStore } from "../../model/store/ChatStore"
import {
  getChangeSilentMode,
  getSilentMode,
} from "../../model/selectors/ChatStoreSelectors"

type ChatHeaderProps = {
  handleCollapse: () => void
  collapsed: boolean
  unreadedMessage: number
}

export const ChatHeader = memo(function ChatHeader(props: ChatHeaderProps) {
  const { handleCollapse, collapsed, unreadedMessage } = props
  const silent = useChatStore(getSilentMode)
  const handleChangeMode = useChatStore(getChangeSilentMode)

  const handleOpenContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    handleChangeMode(!silent)
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
          <ChatIcon color={silent ? "disabled" : "primary"} />
        </Badge>
      </Button>
    </header>
  )
})
