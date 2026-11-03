import { memo } from 'react'

import type { MessageModelNew } from '../../model/types/ChatSchema'

import { getMessages } from '../../model/selectors/ChatStoreSelectors'
import { useChatStore } from '../../model/store/ChatStore'
import { Message } from '../Message/Message'

type MessageItemProps = {
  message: MessageModelNew
  prevMessage: MessageModelNew
}

const messageTextClassName = 'm-0 ml-1 whitespace-break-spaces [overflow-wrap:break-word]'

const MessageItemComponent = (props: MessageItemProps) => {
  const { prevMessage, message } = props

  if (message.message.isSystemMessage) {
    return (
      <Message
        key={message.message.id}
        data={message}
        className={messageTextClassName}
      />
    )
  }

  if (prevMessage?.user.id === message.user.id) {
    return (
      <li
        className="mt-1 hover:bg-foreground/10"
        key={`${message.message.id}-${message.message.blobParams?.loaded}`}
      >
        <Message
          data={message}
          className={messageTextClassName}
        />
      </li>
    )
  }

  return (
    <li
      className="mt-2 hover:bg-foreground/10"
      key={`${message.message.id}-${message.message.blobParams?.loaded}`}
    >
      <h6 className="m-0 text-[1.25em] font-bold [overflow-wrap:break-word]">
        {message.user.username || message.user.id}
      </h6>
      <Message
        data={message}
        className={messageTextClassName}
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
      className="overflow-auto pb-4"
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
