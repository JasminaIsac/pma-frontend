import apiClient from './client';
import { ID, Project, CreateProjectDTO, UpdateProjectDTO, CursorResponse, ProjectCountByCategory } from 'schemas/index';

export const createProject = async (data: CreateProjectDTO) => {
  const { deadline, ...rest } = data;
  const payload = {
    ...rest,
    ...(deadline ? { deadline } : {}),
  };
  return await apiClient.post<Project>('/projects', payload);
};


export const getAllProjects = async () => {
  return await apiClient.get<Project[]>('/projects/all');
};

export const getProjectsCursor = async ( limit = 10, cursor?: string) => {
  return await apiClient.get<CursorResponse<Project>>('/projects', {
    params: { limit, ...(cursor ? { cursor } : {}) },
  });
};

export const getProjectById = async (id: ID)=> {
  return await apiClient.get<Project>(`/projects/${id}`);
};

export const getProjectsCountByCategory = async() => {
  return await apiClient.get<ProjectCountByCategory>(`/projects/category/count`);  
}

export const updateProject = async (
  id: ID,
  data: UpdateProjectDTO
) => {
  return await apiClient.patch<Project>(`/projects/${id}`, data);
};

export const deleteProject = async (id: ID) => {
  return await apiClient.delete<Project>(`/projects/${id}`);
};
