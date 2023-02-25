import { classNames } from "@/shared/lib/classNames/classNames"
import { Badge, Button, TextField } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import ChatIcon from "@mui/icons-material/Chat"
import styles from "./Chat.module.scss"
import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { MessageModel } from "../model/types/ChatSchem"
import { useChatStore } from "../model/store/ChatStore"
import {
  getActionAddMessage,
  getMessages,
} from "../model/selectors/ChatStoreSelectors"
import { getLocalUser, useUserStore } from "@/entities/User"

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
}

export const Chat = (props: ChatProps) => {
  const { onSendMessage } = props
  const messages = useChatStore(getMessages)
  const addMessage = useChatStore(getActionAddMessage)
  const localUser = useUserStore(getLocalUser)
  const [text, setText] = useState("")
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
    addMessage({ data: text, user: localUser })
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

  const MessageItem = (
    message: MessageModel,
    index: number,
    arr: MessageModel[]
  ) => {
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
        <div className={styles.messageUser}>
          {message.user.username || message.user.id}
        </div>
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
