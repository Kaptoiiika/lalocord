import { classNames } from "@/shared/lib/classNames/classNames"
import { Badge, Button, TextField } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { Message } from "../../model/store/types/RoomRTCSchema"
import styles from "./RoomChat.module.scss"
import ChatIcon from "@mui/icons-material/Chat"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"

const getChatCollapsedFromLocalStorage = (): boolean => {
  const json = localStorage.getItem(localstorageKeys.CHATCOLLAPSED)
  if (!json) return false
  const data = JSON.parse(json)
  return !!data
}
const saveChatCollapsedToLocalStorage = (state: boolean) => {
  localStorage.setItem(localstorageKeys.CHATCOLLAPSED, JSON.stringify(state))
}

type RoomChatProps = {
  messages: Message[]
  onSendMessage?: (msg: string) => void
}

export const RoomChat = (props: RoomChatProps) => {
  const [text, setText] = useState("")
  const { messages, onSendMessage } = props
  const [collapsed, setCollapsed] = useState(getChatCollapsedFromLocalStorage())
  const [readedMessage, setReadedMessage] = useState(0)

  const hundleChangeText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.currentTarget.value)
    },
    []
  )

  const hundleSendMessage = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    onSendMessage?.(text)
    setText("")
  }

  const hundleCollapse = () => {
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

  const MessageItem = (message: Message, index: number, arr: Message[]) => {
    if (index && arr[index - 1]?.user === message.user) {
      return (
        <li
          className={classNames([styles.message, styles.messageGroup])}
          key={index}
        >
          <div className={styles.messageText}>{message.data}</div>
        </li>
      )
    }
    return (
      <li className={styles.message} key={index}>
        <div className={styles.messageUser}>{message.user}</div>
        <div className={styles.messageText}>{message.data}</div>
      </li>
    )
  }

  return (
    <aside
      className={classNames(styles.sidebar, { [styles.collapsed]: collapsed })}
    >
      <header className={styles.header}>
        <Button
          sx={{ borderRadius: 0 }}
          className={styles.headerButton}
          onClick={hundleCollapse}
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
        <ul
          ref={(node) => {
            if (!node) return
            node.scrollTop = node.scrollHeight - node.clientHeight
          }}
          className={styles.chatMessages}
        >
          {messages.map(MessageItem)}
        </ul>
        <form onSubmit={hundleSendMessage} className={styles.form}>
          <TextField
            fullWidth
            autoComplete="off"
            value={text}
            onChange={hundleChangeText}
            className={styles.input}
          />
        </form>
      </div>
    </aside>
  )
}
