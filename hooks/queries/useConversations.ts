import { useQuery, useQueryClient, useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { getAllConversations, getConversationsCursor, createConversation  } from '@api/conversation';
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