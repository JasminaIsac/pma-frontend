import apiClient from './client';
import { User, UploadAvatarResponse } from 'schemas';
import { Platform } from 'react-native';

export const getMyProfile = async () => {
  return await apiClient.get<User>('/users/me');
};

export const updateMyAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  console.log('File:', file);
  return await apiClient.patch<{ avatarUrl: string }>(
    '/users/me/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
};

export const deleteMyAvatar = async () => {
  return await apiClient.delete<{ avatarUrl: string | null }>(
    '/me/avatar',
  );
};

export const uploadAvatar = async (uri: string): Promise<UploadAvatarResponse> => {
  const formData = new FormData();
  const cleanUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  const filename = uri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append('avatar', {
    uri: Platform.OS === 'ios' ? uri : cleanUri,
    name: filename,
    type: type,
  } as any);

  const res = await apiClient.patch<UploadAvatarResponse>(
    '/me/avatar',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data, 
    }
  );

  return res.data;
};