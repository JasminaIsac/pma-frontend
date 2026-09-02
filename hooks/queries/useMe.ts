import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getMyProfile } from '@api/auth';
import { uploadAvatar, deleteMyAvatar } from '@api/profile';
import { useAuth } from '@contexts/AuthContext';

export const useMe = () => {
  const { userId, logout } = useAuth();

  const query = useQuery({
    queryKey: ['me', userId],
    queryFn: getMyProfile,
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    retry: (failureCount, error: AxiosError) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if ((query.error as AxiosError)?.response?.status === 401) {
      logout();
    }
  }, [query.error]);

  return query;
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
      queryClient.invalidateQueries({ queryKey: ['me', userId] });
    },
  });
};
