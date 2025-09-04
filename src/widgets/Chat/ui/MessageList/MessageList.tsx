import { memo } from 'react'

import { Typography } from '@mui/material'
import { classNames } from 'src/shared/lib/classNames/classNames'

import type { MessageModelNew } from '../../model/types/ChatSchema'

import { getMessages } from '../../model/selectors/ChatStoreSelectors'
import { useChatStore } from '../../model/store/ChatStore'
import { Message } from '../Message/Message'

import styles from './MessageList.module.scss'

type MessageItemProps = {
  message: MessageModelNew
  prevMessage: MessageModelNew
}

const MessageItemComponent = (props: MessageItemProps) => {
  const { prevMessage, message } = props

  if (message.message.isSystemMessage) {
    return (
      <Message
        key={message.message.id}
        data={message}
        className={styles.messageText}
      />
    )
  }

  if (prevMessage?.user === message.user) {
    return (
      <li
        className={classNames(styles.message, styles.messageGroup)}
        key={`${message.message.id}-${message.message.blobParams?.loaded}`}
      >
        <Message
          data={message}
          className={styles.messageText}
        />
      </li>
    )
  }

  return (
    <li
      className={styles.message}
      key={`${message.message.id}-${message.message.blobParams?.loaded}`}
    >
      <Typography
        component="h6"
        className={styles.messageUser}
      >
        {message.user.username || message.user.id}
      </Typography>
      <Message
        data={message}
        className={styles.messageText}
      />
    </li>
  )
}

export const MessageItem = memo(MessageItemComponent)

export const MessageList = memo(function MessageList() {
  const [messageList] = useChatStore(getMessages)

  const messages: MessageModelNew[] = [...messageList.values()]

  return (
    <ul
      className={styles.list}
      ref={(node) => {
        if (!node) return
        node.scrollTop = node.scrollHeight - node.clientHeight
      }}
    >
      {messages.map((value, index, arr) => (
        <MessageItem
          key={value.message.id}
          prevMessage={arr[index - 1]}
          message={value}
        />
      ))}
    </ul>
  )
})
