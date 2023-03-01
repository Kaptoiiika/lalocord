import { Button, Badge } from "@mui/material"
import styles from "./ChatHeader.module.scss"
import ChatIcon from "@mui/icons-material/Chat"
import { classNames } from "@/shared/lib/classNames/classNames"
import { memo } from "react"

type ChatHeaderProps = {
  handleCollapse: () => void
  collapsed: boolean
  unreadedMessage: number
}

export const ChatHeader = memo(function ChatHeader(props: ChatHeaderProps) {
  const { handleCollapse, collapsed, unreadedMessage } = props

  return (
    <header
      className={classNames(styles.header, {
        [styles.collapsed]: collapsed,
      })}
    >
      <Button
        sx={{ borderRadius: 0 }}
        className={styles.headerButton}
        onClick={handleCollapse}
        aria-label={collapsed ? "Open chat" : "Hide chat"}
      >
        <Badge color="secondary" badgeContent={unreadedMessage}>
          <ChatIcon />
        </Badge>
      </Button>
    </header>
  )
})
