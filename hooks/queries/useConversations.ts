import { useQuery, useQueryClient, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import {
  getAllConversations,
  getConversationsCursor,
  createConversation,
  updateConversationName,
  updateConversationCover,
  deleteConversationCover,
  addParticipants,
  removeParticipant,
  leaveConversation,
  getConversationById,
} from '@api/conversation';
import { Conversation, CursorResponse } from 'schemas';
import { ID, CreateConversationDTO } from 'schemas/index';

export const useConversations = (userId: ID) => {
  return useQuery<Conversation[]>({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const res = await getAllConversations();
      return res.data;
    },
    staleTime: 1000 * 30,
    enabled: Boolean(userId),
  });
};

export const useConversationsCursor = (userId: string | undefined, limit = 10) => {
  return useInfiniteQuery<CursorResponse<Conversation>, Error>({
    queryKey: ['conversations', 'cursor', userId, limit], 
    
    queryFn: async ({ pageParam }) => {
      const res = await getConversationsCursor( limit, pageParam as string | undefined );
      return res as unknown as CursorResponse<Conversation>;
    },
    
    getNextPageParam: (lastPage) => lastPage?.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60,
    initialPageParam: undefined,
    enabled: !!userId, 
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, CreateConversationDTO>({
    mutationFn: async (data: CreateConversationDTO) => {
      const res = await createConversation(data);
      return res as unknown as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', 'cursor'] });
    },
  });
};

export const useConversation = (id: ID) => {
  return useQuery<Conversation>({
    queryKey: ['conversation', id],
    queryFn: () => getConversationById(id),
    enabled: !!id,
  });
};

const invalidateConversation = (queryClient: ReturnType<typeof useQueryClient>, id: ID) => {
  queryClient.invalidateQueries({ queryKey: ['conversation', id] });
  queryClient.invalidateQueries({ queryKey: ['conversations'] });
  queryClient.invalidateQueries({ queryKey: ['conversations', 'cursor'] });
};

export const useUpdateConversationName = (id: ID) => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, string>({
    mutationFn: (name) => updateConversationName(id, name),
    onSuccess: () => invalidateConversation(queryClient, id),
  });
};

export const useUpdateConversationCover = (id: ID) => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, string>({
    mutationFn: (localUri) => updateConversationCover(id, localUri),
    onSuccess: () => invalidateConversation(queryClient, id),
  });
};

export const useDeleteConversationCover = (id: ID) => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, void>({
    mutationFn: () => deleteConversationCover(id),
    onSuccess: () => invalidateConversation(queryClient, id),
  });
};

export const useAddParticipants = (id: ID) => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, ID[]>({
    mutationFn: (participantIds) => addParticipants(id, participantIds),
    onSuccess: () => invalidateConversation(queryClient, id),
  });
};

export const useRemoveParticipant = (id: ID) => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, ID>({
    mutationFn: (userId) => removeParticipant(id, userId),
    onSuccess: () => invalidateConversation(queryClient, id),
  });
};

export const useLeaveConversation = (id: ID) => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, void>({
    mutationFn: () => leaveConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', 'cursor'] });
    },
  });
};