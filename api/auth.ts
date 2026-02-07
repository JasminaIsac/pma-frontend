import apiClient from './client';
import { LoginDTO, LoginResponse, ChangePasswordDTO, ChangePasswordResponse, User } from 'schemas';

export const login = async (data: LoginDTO): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse, LoginResponse>('/auth/login', data);
};

export const changePassword = async (data: ChangePasswordDTO) => {
  return await apiClient.post<ChangePasswordResponse, ChangePasswordResponse>(
    '/auth/change-password',
    data
  );
};

export const getMyProfile = async (): Promise<User> => {
  return apiClient.get<User, User>('/me');
};