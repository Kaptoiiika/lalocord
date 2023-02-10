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
      <header>Chat</header>
      <div className={styles.chatMessages}>
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <div>{message.user}</div>
              <div>{message.data}</div>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={hundleSendMessage} className={styles.input}>
        <TextField
          fullWidth
          autoComplete="off"
          value={text}
          onChange={hundleChangeText}
        />
      </form>
    </Paper>
  )
}
