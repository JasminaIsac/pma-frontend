import apiClient from './client';
import { ID,
  UserToProject,
  ProjectMember,
  UserProject,
  CreateUserToProjectDTO,
  UpdateUserToProjectDTO,
  Project,
} from 'schemas';

export const addUserToProject = async (
  data: CreateUserToProjectDTO
) => {
  const res = await apiClient.post<UserToProject>('/users-to-projects', data);
  return res;
};

export const getAllUserProjectRelations = async () => {
  return await apiClient.get<UserToProject[]>('/users-to-projects');
};

export const getProjectMembers = async ( projectId: ID ) => {
  return await apiClient.get<ProjectMember[]>(
    `/users-to-projects/project/${projectId}`
  );
};

export const getUserProjects = async ( userId: ID ) => {
  return await apiClient.get<Project[]>(
    `/users-to-projects/user/${userId}`
  );
};

export const updateUserProject = async (
  id: ID,
  data: UpdateUserToProjectDTO
) => {
  return await apiClient.patch<UserToProject>(
    `/users-to-projects/${id}`,
    data
  );
};

export const removeUserFromProject = async (id: ID) => {
  await apiClient.delete(`/users-to-projects/${id}`);
};
