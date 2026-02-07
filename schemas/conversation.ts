import { ID, ISODate } from './common';
import { ConversationType, UserStatus } from './enums';
import { Message } from './message';

export interface Conversation {
  id: ID;
  name: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  messages?: Message[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: ISODate;
  updatedAt?: ISODate;
}

export interface ConversationParticipant {
  id: ID;
  userId: ID;
  conversationId: ID;
  lastReadAt?: ISODate | null;
  joinedAt: ISODate;
  user: UserPreview;
}

export interface CreateConversationDTO {
  type: ConversationType;
  participantIds: ID[];
  name?: string;
}

interface UserPreview {
  id: ID;
  name: string;
  tel: string;
  avatarUrl?: string | null;
  status?: UserStatus;
}