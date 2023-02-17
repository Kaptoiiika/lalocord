import { classNames } from "@/shared/lib/classNames/classNames"
import { TextField } from "@mui/material"
import { useCallback, useState } from "react"
import { Message } from "../../model/types/RoomSchema"
import styles from "./RoomChat.module.scss"

type RoomChatProps = {
  messages: Message[]
  onSendMessage?: (msg: string) => void
}

export const RoomChat = (props: RoomChatProps) => {
  const [text, setText] = useState("")
  const { messages, onSendMessage } = props

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
    <div className={styles.sidebar}>
      <header className={styles.header}>Chat</header>
      <div className={styles.chatMessages}>
        <ul>{messages.map(MessageItem)}</ul>
      </div>
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
  )
}
