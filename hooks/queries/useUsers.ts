import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as api from '@api/users';
import { ID, User, CreateUserDTO, UpdateUserDTO, CursorResponse } from 'schemas/index';
import { useAuth } from '@contexts/AuthContext';

export const useUsers = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.getAllUsers();
      return res as unknown as User[];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export const useUsersCursor = (limit = 10) => {
  return useInfiniteQuery<CursorResponse<User>, Error>({
    queryKey: ['users', 'cursor', limit],
    queryFn: async ({ pageParam }) => {
      const res = await api.getUsersCursor(limit, pageParam as string | undefined);
      return res as unknown as CursorResponse<User>;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60,
    initialPageParam: '',
  });
};

export const useUser = (id: ID) => {
  return useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.getUserById(id);
      return res as unknown as User;
    },
    enabled: Boolean(id),
  });
};

export const useUserProjectsCount = (id: ID) => {
  return useQuery<number>({
    queryKey: ['user', id, 'projects', 'count'],
    queryFn: async () => {
      const res = await api.getUserProjectsCount(id);
      return res as unknown as number;
    },
    enabled: Boolean(id),
  });
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'cursor'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { userId: currentLoggedInId } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: ID; data: UpdateUserDTO }) =>
      await api.updateUser(id, data),
    onSuccess: (res, variables) => {
      const updatedUser = res;

      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['user', variables.id], updatedUser);

      if (variables.id === currentLoggedInId) {
        queryClient.setQueryData(['me', currentLoggedInId], updatedUser);
        queryClient.invalidateQueries({ queryKey: ['me', currentLoggedInId] });
      }
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'cursor'] });
    },
  });
};