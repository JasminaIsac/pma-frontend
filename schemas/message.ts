import { ID, ISODate } from './common';

export interface MessageSender {
  id: ID;
  name: string;
  avatarUrl: string;
}

export type AttachmentType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface MessageAttachment {
  id: ID;
  url: string;
  type: AttachmentType;
  filename: string;
  mimeType: string;
  size: number;
}

export interface MentionData {
  id: ID;
  name: string;
  type: 'project';
}

export type PendingAttachmentStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface PendingAttachment {
  localUri: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedId?: string;
  uploadedUrl?: string;
  status: PendingAttachmentStatus;
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  message: string;
  sender: MessageSender;
  attachments: MessageAttachment[];
  mentions: MentionData[];
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
