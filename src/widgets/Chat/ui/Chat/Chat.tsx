import { classNames } from "@/shared/lib/classNames/classNames"
import { Badge, Button, TextField } from "@mui/material"
import { ClipboardEvent, useCallback, useEffect, useState } from "react"
import ChatIcon from "@mui/icons-material/Chat"
import styles from "./Chat.module.scss"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { useChatStore } from "../../model/store/ChatStore"
import {
  getActionAddMessage,
  getMessages,
} from "../../model/selectors/ChatStoreSelectors"
import { getLocalUser, useUserStore } from "@/entities/User"
import { MessageList } from "../MessageList/MessageList"
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary"
import { ImagePreview } from "@/features/ImagePreview"

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
  const addMessage = useChatStore(getActionAddMessage)
  const localUser = useUserStore(getLocalUser)
  const [text, setText] = useState("")
  const [collapsed, setCollapsed] = useState(getChatCollapsedFromLocalStorage())
  const [readedMessage, setReadedMessage] = useState(0)

  const handleChangeText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.currentTarget.value)
    },
    []
  )

  const handleSendFile = async (data: DataTransfer) => {
    const items = Array.from(data.items)

    const item = items.find((item) => !!item.getAsFile())
    if (!item) return

    const blob = item.getAsFile()
    console.log(blob)
    if (blob) {
      onSendFile?.(blob)
      addMessage({
        data: { type: "image", src: URL.createObjectURL(blob) },
        user: localUser,
      })
    }
  }

  const handlePasteFile = async (e: ClipboardEvent) => {
    handleSendFile(e.clipboardData)
  }
  const handleDropFile = async (e: React.DragEvent) => {
    e.preventDefault()
    handleSendFile(e.dataTransfer)
  }

  const handleSendMessage = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    if (text === "") return
    addMessage({ data: text, user: localUser })
    onSendMessage?.(text)
    setText("")
  }

  const handleCollapse = () => {
    setCollapsed((prev) => {
      saveChatCollapsedToLocalStorage(!prev)
      return !prev
    })
  }

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
      <header className={styles.header}>
        <Button
          sx={{ borderRadius: 0 }}
          className={styles.headerButton}
          onClick={handleCollapse}
          aria-label={collapsed ? "Open chat" : "Hide chat"}
        >
          <Badge
            color="secondary"
            badgeContent={messages.length - readedMessage}
          >
            <ChatIcon />
          </Badge>
        </Button>
      </header>
      <div className={styles.chat}>
        <ErrorBoundary errorText="Chat is broken(">
          <MessageList />
          <form onSubmit={handleSendMessage} className={styles.form}>
            <TextField
              onPaste={handlePasteFile}
              onDrop={handleDropFile}
              fullWidth
              autoComplete="off"
              value={text}
              onChange={handleChangeText}
              className={styles.input}
            />
          </form>
        </ErrorBoundary>
      </div>
      <ImagePreview />
    </aside>
  )
}
