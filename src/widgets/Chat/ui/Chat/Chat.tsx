import { classNames } from "@/shared/lib/classNames/classNames"
import { useCallback, useEffect, useState } from "react"
import styles from "./Chat.module.scss"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { useChatStore } from "../../model/store/ChatStore"
import { getMessages } from "../../model/selectors/ChatStoreSelectors"
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
  onSendFile?: (blob: Blob) => void
}

export const Chat = (props: ChatProps) => {
  const { onSendMessage, onSendFile } = props
  const messages = useChatStore(getMessages)
  const [collapsed, setCollapsed] = useState(getChatCollapsedFromLocalStorage())
  const [readedMessage, setReadedMessage] = useState(messages.length)

  const handleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      saveChatCollapsedToLocalStorage(!prev)
      return !prev
    })
  }, [])

  useEffect(() => {
    if (!collapsed) {
      setReadedMessage(messages.length)
    }
  }, [messages, collapsed])

  return (
    <aside
      className={classNames(styles.sidebar, {
        [styles.collapsed]: collapsed,
      })}
    >
      <ChatHeader
        collapsed={collapsed}
        handleCollapse={handleCollapse}
        unreadedMessage={messages.length - readedMessage}
      />
      <div className={styles.chat}>
        <ErrorBoundary errorText="Chat is broken(">
          <MessageList />
          <ChatInput onSendMessage={onSendMessage} onSendFile={onSendFile} />
        </ErrorBoundary>
      </div>
      <ImagePreview />
    </aside>
  )
}
