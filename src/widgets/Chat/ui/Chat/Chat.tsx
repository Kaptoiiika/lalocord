import { useCallback, useEffect, useState } from 'react';

import { ImagePreview } from 'src/features/ImagePreview';
import { localstorageKeys } from 'src/shared/const/localstorageKeys';
import { classNames } from 'src/shared/lib/classNames/classNames';
import { ErrorBoundary } from 'src/shared/ui/ErrorBoundary';

import { useChatStore } from '../../model/store/ChatStore';
import { ChatHeader } from '../ChatHeader/ChatHeader';
import { ChatInput } from '../ChatInput/ChatInput';
import { MessageList } from '../MessageList/MessageList';

import styles from './Chat.module.scss';

const getChatCollapsedFromLocalStorage = (): boolean => {
  const json = localStorage.getItem(localstorageKeys.CHATCOLLAPSED);

  if (!json) return false;
  const data = JSON.parse(json);

  return !!data;
};
const saveChatCollapsedToLocalStorage = (state: boolean) => {
  localStorage.setItem(localstorageKeys.CHATCOLLAPSED, JSON.stringify(state));
};

type ChatProps = {
  onSendMessage?: (msg: string) => void;
  onSendFile?: (blob: Blob, name?: string) => void;
};

export const Chat = (props: ChatProps) => {
  const { onSendMessage, onSendFile } = props;
  const messagesLength = useChatStore((state) => state.messageLength);
  const [collapsed, setCollapsed] = useState(getChatCollapsedFromLocalStorage());
  const [readedMessage, setReadedMessage] = useState(messagesLength);

  const handleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      saveChatCollapsedToLocalStorage(!prev);

      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!collapsed) {
      setReadedMessage(messagesLength);
    }
  }, [messagesLength, collapsed]);

  const unreadedMessage = Math.max(messagesLength - readedMessage, 0);

  return (
    <aside
      className={classNames(styles.sidebar, {
        [styles.collapsed]: collapsed,
      })}
    >
      <ChatHeader
        collapsed={collapsed}
        handleCollapse={handleCollapse}
        unreadedMessage={unreadedMessage}
      />
      <ErrorBoundary errorText="Chat is broken(">
        <div className={styles.chat}>
          <MessageList />
          <ChatInput onSendMessage={onSendMessage} onSendFile={onSendFile} />
        </div>
      </ErrorBoundary>
      <ImagePreview />
    </aside>
  );
};
