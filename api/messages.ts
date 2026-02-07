import apiClient from './client';
import {
  ID,
  Message,
  CreateMessageDTO,
  UpdateMessageDTO,
  CursorResponse,
} from 'schemas';

export const createMessage = async (data: CreateMessageDTO) => {
  return await apiClient.post<Message>('/messages', data) as unknown as Message;
};

export const getConversationMessages = async (conversationId: ID) => {
  return await apiClient.get<Message[]>(
    `/messages/conversation/${conversationId}/all`
  );
};

export const getConversationMessagesCursor = async (
  conversationId: ID,
  limit = 20,
  cursor?: string
): Promise<CursorResponse<Message>> => {
  const res = await apiClient.get<CursorResponse<Message>>(
    `/messages/conversation/${conversationId}`,
    { params: { limit, cursor } }
  );
  return res as unknown as CursorResponse<Message>;
};

export const getMessageById = async (id: ID) => {
  return await apiClient.get<Message>(`/messages/${id}`);
};

export const updateMessage = async (
  id: ID,
  data: UpdateMessageDTO
) => {
  return await apiClient.put<Message>(`/messages/${id}`, data);
};

export const markMessageAsRead = async (conversationId: ID) => {
  return await apiClient.patch<Message>(`/messages/read/${conversationId}`);
};

export const deleteMessage = async (id: ID) => {
  return await apiClient.delete<Message>(`/messages/${id}`);
};
