import apiClient from './client';
import {
  ID,
  User,
  CreateUserDTO,
  UpdateUserDTO,
  CursorResponse,
} from 'schemas';

export const createUser = async (
  data: CreateUserDTO
) => {
  return await apiClient.post<User>('/users', data);
};

export const getAllUsers = async () => {
  return await apiClient.get<User[]>('/users/all');
};

export const getUsersCursor = async (
  limit = 10,
  cursor?: ID | string
) => {
  return await apiClient.get<CursorResponse<User>>('/users', {
    params: { limit, cursor },
  });
};

export const getUserById = async (id: ID) => {
  return await apiClient.get<User>(`/users/${id}`);
};

export const getUserProjectsCount = async (id: ID) => {
  return await apiClient.get<number>(`/users/${id}/projects/count`);
}

export const updateUser = async (
  id: ID,
  data: UpdateUserDTO
) => {
  const res = await apiClient.patch<User>(`/users/${id}`, data);
  return res;
};

export const deleteUser = async (id: ID) => {
  return await apiClient.delete<User>(`/users/${id}`);
};
