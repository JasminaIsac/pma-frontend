import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfile } from '@api/auth';
import { uploadAvatar, deleteMyAvatar } from '@api/profile';
import { useAuth } from '@contexts/AuthContext';

export const useMe = () => {
  const { userId, logout } = useAuth();

  return useQuery({
    queryKey: ['me', userId],
    queryFn: getMyProfile,
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        logout();
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uri: string) => uploadAvatar(uri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: deleteMyAvatar,
    onSuccess: () => {
      // Invalidăm 'me' pentru a forța reîncărcarea profilului fără avatarUrl
      queryClient.invalidateQueries({ queryKey: ['me', userId] });
    },
  });
};
