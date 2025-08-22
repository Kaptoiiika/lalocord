import type { RTCChatMessage } from 'src/entities/RTCClient';
import type { UserModel } from 'src/entities/User';

export interface ChatSchema {
  messageList: [Map<string, MessageModelNew>];
  messageLength: number;
  addNewMessage: (message: RTCChatMessage, user: UserModel) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
}

export interface MessageModelNew {
  user: UserModel;
  message: RTCChatMessage;
}
