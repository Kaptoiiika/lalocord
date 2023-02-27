import { classNames } from "@/shared/lib/classNames/classNames"
import { Typography } from "@mui/material"
import { getMessages } from "../../model/selectors/ChatStoreSelectors"
import { useChatStore } from "../../model/store/ChatStore"
import { MessageModel } from "../../model/types/ChatSchem"
import { Message } from "../Message/Message"
import styles from "./MessageList.module.scss"

type MessageListProps = {}

export const MessageList = (props: MessageListProps) => {
  const messages = useChatStore(getMessages)
  const {} = props

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
          <Message message={message} className={styles.messageText} />
        </li>
      )
    }

    return (
      <li className={styles.message} key={index}>
        <Typography component="h6" className={styles.messageUser}>
          {message.user.username || message.user.id}
        </Typography>
        <Message message={message} className={styles.messageText} />
      </li>
    )
  }

  return (
    <ul
      className={styles.list}
      ref={(node) => {
        if (!node) return
        node.scrollTop = node.scrollHeight - node.clientHeight
      }}
    >
      {messages.map(MessageItem)}
    </ul>
  )
}
