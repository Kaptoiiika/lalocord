import { classNames } from "@/shared/lib/classNames/classNames"
import { useCallback, useEffect, useState } from "react"
import styles from "./Chat.module.scss"
import { localstorageKeys } from "@/shared/const/localstorageKeys"
import { useChatStore } from "../../model/store/ChatStore"
import { MessageList } from "../MessageList/MessageList"
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary"
import { ImagePreview } from "@/features/ImagePreview"
import { ChatInput } from "../ChatInput/ChatInput"
import { ChatHeader } from "../ChatHeader/ChatHeader"

const getChatCollapsedFromLocalStorage = (): boolean => {
  const json = localStorage.getItem(localstorageKeys.CHATCOLLAPSED)
  if (!json) return false
  const data = JSON.parse(json)
  return !!data
}
const saveChatCollapsedToLocalStorage = (state: boolean) => {
  localStorage.setItem(localstorageKeys.CHATCOLLAPSED, JSON.stringify(state))
}

type ChatProps = {
  onSendMessage?: (msg: string) => void
  onSendFile?: (blob: Blob, name?: string) => void
}

export const Chat = (props: ChatProps) => {
  const { onSendMessage, onSendFile } = props
  const messagesLength = useChatStore((state) => state.messageLength)
  const [collapsed, setCollapsed] = useState(getChatCollapsedFromLocalStorage())
  const [readedMessage, setReadedMessage] = useState(messagesLength)

  const handleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      saveChatCollapsedToLocalStorage(!prev)
      return !prev
    })
  }, [])

  useEffect(() => {
    if (!collapsed) {
      setReadedMessage(messagesLength)
    }
  }, [messagesLength, collapsed])

  const unreadedMessage = Math.max(messagesLength - readedMessage, 0)

  return (
    <aside
      className={classNames(styles.sidebar, {
        [styles.collapsed]: collapsed,
      })}
    >
      <ChatHeader
        collapsed={collapsed}
        handleCollapse={handleCollapse}
        unreadedMessage={unreadedMessage}
      />
      <ErrorBoundary errorText="Chat is broken(">
        <div className={styles.chat}>
          <MessageList />
          <ChatInput onSendMessage={onSendMessage} onSendFile={onSendFile} />
        </div>
      </ErrorBoundary>
      <ImagePreview />
    </aside>
  )
}
