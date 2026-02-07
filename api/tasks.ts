import apiClient from './client';
import { ID, TaskWithRelations, CreateTaskDTO, UpdateTaskDTO, CursorResponse } from 'schemas';

export const createTask = async (
  data: CreateTaskDTO
) => {
  return await apiClient.post<TaskWithRelations>('/tasks', data);
};

export const getAllTasks = async () => {
  return await apiClient.get<TaskWithRelations[]>('/tasks/all');
};

export const getTasksCursor = async ( limit = 10, cursor?: string ) => {
  return await apiClient.get<CursorResponse<TaskWithRelations>>('/tasks', {
    params: { limit, ...(cursor ? { cursor } : {}) },
  });
};

export const getTaskById = async (id: ID) => {
  return await apiClient.get<TaskWithRelations>(`/tasks/${id}`);
};

export const getTasksByProjectId = async (projectId: ID) => {
  return await apiClient.get<TaskWithRelations[]>(
    `/tasks/project/${projectId}`,
  );
};

export const getTasksByAssigneeId = async (assigneeId: ID) => {
  return await apiClient.get<TaskWithRelations[]>(
    `/tasks/assignee/${assigneeId}`,
  );
};

export const getTasksByProjectAndAssignee = async ( projectId: ID, assigneeId: ID ) => {
  return await apiClient.get<TaskWithRelations[]>(
    `/tasks/project/${projectId}/assignee/${assigneeId}`,
  );
};

export const getTaskCountByProjectAndAssignee = async ( projectId: ID, assigneeId: ID ) => {
  return await apiClient.get<number>(
    `/tasks/project/${projectId}/assignee/${assigneeId}/count`,
  );
};

export const getTaskCountByProject = async ( projectId: ID ) => {
  return await apiClient.get<number>(
    `/tasks/project/${projectId}/count`,
  );
};

export const updateTask = async ( id: ID, data: UpdateTaskDTO ) => {
  return await apiClient.patch<TaskWithRelations>(`/tasks/${id}`, data);
};

export const deleteTask = async (id: ID) => {
  return await apiClient.delete<TaskWithRelations>(`/tasks/${id}`);
};
