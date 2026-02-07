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
  return res;
};

export const getAllConversations = async () => {
  return await apiClient.get<Conversation[]>('/conversations/all');
};

export const getConversationsCursor = async (
  limitSize = 10,
  cursor?: ID | string
) => {
  const res = await apiClient.get<CursorResponse<Conversation>>('/conversations', {
    params: { 
      limit: limitSize,
      cursor: cursor 
    }
  });
  return res as unknown as CursorResponse<Conversation>;
};

export const getConversationById = async (id: ID) => {
  return await apiClient.get<Conversation>(`/conversations/${id}`) as unknown as Conversation;
};

export const deleteConversation = async (id: ID) => {
  return await apiClient.delete<Conversation>(`/conversations/${id}`);
};
