import { Platform } from 'react-native';
import apiClient from './client';
import {
  ID,
  Conversation,
  CreateConversationDTO,
  CursorResponse,
} from 'schemas';

export const createConversation = async (
  data: CreateConversationDTO
) => {
  const res = await apiClient.post<Conversation>('/conversations', data);
  return res as unknown as Conversation;
};

export const getAllConversations = async () => {
  return await apiClient.get<Conversation[]>('/conversations/all') as unknown as Conversation[];
};

export const getConversationsCursor = async (
  limitSize = 10,
  cursor?: ID | string
) => {
  const res = await apiClient.get<CursorResponse<Conversation>>('/conversations', {
    params: {
      limit: limitSize,
      cursor: cursor,
    }
  });
  return res as unknown as CursorResponse<Conversation>;
};

export const getConversationById = async (id: ID) => {
  return await apiClient.get<Conversation>(`/conversations/${id}`) as unknown as Conversation;
};

export const deleteConversation = async (id: ID) => {
  return await apiClient.delete<Conversation>(`/conversations/${id}`) as unknown as Conversation;
};

export const updateConversationName = async (id: ID, name: string): Promise<Conversation> => {
  const res = await apiClient.patch<Conversation>(`/conversations/${id}/name`, { name });
  return res as unknown as Conversation;
};

export const updateConversationCover = async (id: ID, localUri: string): Promise<Conversation> => {
  const formData = new FormData();
  const cleanUri = Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;
  const filename = localUri.split('/').pop() || 'cover.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('cover', {
    uri: Platform.OS === 'ios' ? localUri : cleanUri,
    name: filename,
    type,
  } as any);

  const res = await apiClient.patch<Conversation>(`/conversations/${id}/cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });
  return res as unknown as Conversation;
};

export const deleteConversationCover = async (id: ID): Promise<Conversation> => {
  const res = await apiClient.delete<Conversation>(`/conversations/${id}/cover`);
  return res as unknown as Conversation;
};

export const addParticipants = async (id: ID, participantIds: ID[]): Promise<Conversation> => {
  const res = await apiClient.post<Conversation>(`/conversations/${id}/participants`, { participantIds });
  return res as unknown as Conversation;
};

export const removeParticipant = async (id: ID, userId: ID): Promise<Conversation> => {
  const res = await apiClient.delete<Conversation>(`/conversations/${id}/participants/${userId}`);
  return res as unknown as Conversation;
};

export const leaveConversation = async (id: ID): Promise<Conversation> => {
  const res = await apiClient.post<Conversation>(`/conversations/${id}/leave`);
  return res as unknown as Conversation;
};
