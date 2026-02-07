import { ID, ISODate } from './common';

export interface MessageSender {
  id: ID;
  name: string;
  avatarUrl: string;
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  message: string;
  sender: MessageSender;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt?: ISODate | null;
}

export interface CreateMessageDTO {
  conversationId: ID;
  message: string;
}

export interface UpdateMessageDTO {
  message: string;
}
