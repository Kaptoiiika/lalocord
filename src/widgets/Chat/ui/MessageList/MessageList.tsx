import { classNames } from "@/shared/lib/classNames/classNames"
import { Typography } from "@mui/material"
import { memo } from "react"
import { getMessages } from "../../model/selectors/ChatStoreSelectors"
import { useChatStore } from "../../model/store/ChatStore"
import { MessageModelNew } from "../../model/types/ChatSchema"
import { Message } from "../Message/Message"
import styles from "./MessageList.module.scss"

type MessageListProps = {}

const MessageItem = (
  message: MessageModelNew,
  index: number,
  arr: MessageModelNew[]
) => {
  if (message.message.isSystemMessage) {
    return (
      <Message
        key={message.message.id}
        data={message}
        className={styles.messageText}
      />
    )
  }

  if (index && arr[index - 1]?.user === message.user) {
    return (
      <li
        className={classNames([styles.message, styles.messageGroup])}
        key={`${message.message.id}-${message.message.blobParams?.loaded}`}
      >
        <Message data={message} className={styles.messageText} />
      </li>
    )
  }

  return (
    <li
      className={styles.message}
      key={`${message.message.id}-${message.message.blobParams?.loaded}`}
    >
      <Typography component="h6" className={styles.messageUser}>
        {message.user.username || message.user.id}
      </Typography>
      <Message data={message} className={styles.messageText} />
    </li>
  )
}

export const MessageList = memo(function MessageList(props: MessageListProps) {
  const [messageList] = useChatStore(getMessages)
  const {} = props

  const messages: MessageModelNew[] = []
  messageList.forEach((message) => {
    messages.push(message)
  })

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
})
