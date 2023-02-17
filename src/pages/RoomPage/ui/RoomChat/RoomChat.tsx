import { classNames } from "@/shared/lib/classNames/classNames"
import { Paper, TextField } from "@mui/material"
import { useCallback, useState } from "react"
import { Message } from "../../model/types/RoomSchema"
import styles from "./RoomChat.module.scss"

type RoomChatProps = {
  messages: Message[]
  onSendMessage?: (msg: string) => void
}

export const RoomChat = (props: RoomChatProps) => {
  const [text, setText] = useState("")
  const [collapsed, setCollapsed] = useState(false)
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

  return (
    <Paper className={styles.sidebar}>
      <header className={styles.header}>Chat</header>
      <div className={styles.chatMessages}>
        <ul>
          {messages.map((message, index) => (
            <li className={styles.message} key={index}>
              <div className={styles.messageUser}>{message.user}</div>
              <div className={styles.messageText}>{message.data}</div>
            </li>
          ))}
        </ul>
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
    </Paper>
  )
}
