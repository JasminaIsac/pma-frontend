import { useQuery, useMutation, useQueryClient, keepPreviousData, InfiniteData } from '@tanstack/react-query';
import * as api from '@api/tasks';
import { ID, TaskWithRelations, CreateTaskDTO, UpdateTaskDTO, CursorResponse, TaskCountByMember } from 'schemas';

// --- Fetch all tasks ---
export const useTasks = () => {
  return useQuery<TaskWithRelations[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.getAllTasks();
      return res as unknown as TaskWithRelations[];
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export type UseTasksCursorData = InfiniteData<CursorResponse<TaskWithRelations>>;

// --- Fetch tasks with cursor pagination ---
export const useTasksCursor = (limit = 10) => {
  return useQuery<CursorResponse<TaskWithRelations>, Error, CursorResponse<TaskWithRelations>, readonly unknown[]>({
    queryKey: ['tasks', 'cursor', limit],
    queryFn: async ({ pageParam }) => {
      const res = await api.getTasksCursor(limit, pageParam as string | undefined);
      return res as unknown as CursorResponse<TaskWithRelations>;
    },
    getNextPageParam: (lastPage: { hasMore: any; nextCursor: any; }) => lastPage?.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60,
    initialPageParam: undefined,
  });
};

// --- Fetch single task ---
export const useTask = (id: ID) => {
  return useQuery<TaskWithRelations>({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await api.getTaskById(id);
      return res as unknown as TaskWithRelations;
    },
    enabled: !!id,
  });
};

// --- Fetch tasks by project ID ---
export const useTasksByProjectId = (projectId: ID) => {
  return useQuery<TaskWithRelations[]>({
    queryKey: ['tasks', 'project', projectId],
    queryFn: async () => {
      const res = await api.getTasksByProjectId(projectId);
      return res as unknown as TaskWithRelations[];
    },
    enabled: !!projectId,
  });
};

// --- Fetch tasks by assignee ID ---
export const useTasksByAssigneeId = (assigneeId?: ID) => {
  return useQuery<TaskWithRelations[]>({
    queryKey: ['tasks', 'assignee', assigneeId],
    queryFn: async () => {
      const res = await api.getTasksByAssigneeId(assigneeId!);
      return res as unknown as TaskWithRelations[];
    },
    enabled: !!assigneeId,
  });
};

// --- Fetch tasks by project ID and assignee ID ---
export const useTasksByProjectAndAssignee = (
  projectId: ID,
  assigneeId: ID,
) => {
  return useQuery<TaskWithRelations[]>({
    queryKey: ['tasks', 'project', projectId, 'assignee', assigneeId],
    queryFn: async () => {
      const res = await api.getTasksByProjectAndAssignee(projectId, assigneeId);
      return res as unknown as TaskWithRelations[];
    },
    enabled: !!projectId && !!assigneeId,
  });
};

// --- Fetch task count by project ID ---
export const useTaskCountByProjectAndAssignee = (
  projectId: ID,
  assigneeId: ID,
) => {
  return useQuery<number>({
    queryKey: ['tasks', 'count', projectId, assigneeId],
    queryFn: async () => {
      const res = await api.getTaskCountByProjectAndAssignee(projectId, assigneeId);
      return res as unknown as number;
    },
    enabled: !!projectId && !!assigneeId,
    staleTime: 1000 * 30,
  });
};

export const useTaskCountByProject = (projectId: ID) => {
  return useQuery<TaskCountByMember[]>({
    queryKey: ['tasks', 'count', projectId],
    queryFn: async () => {
      const res = await api.getTaskCountByProject(projectId);
      return res as unknown as TaskCountByMember[];
    },
    enabled: !!projectId,
    staleTime: 1000 * 30,
  });
}

// --- Add task ---
export const useAddTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDTO) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'cursor'] });
    },
  });
};

// --- Update task ---
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({ id, data }: { id: ID; data: UpdateTaskDTO }) => {
      const res =  await api.updateTask(id, data);
      return res as unknown as TaskWithRelations;
    },
    onSuccess: (res) => {
      const updated = res as unknown as TaskWithRelations;
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'cursor'] });
      queryClient.invalidateQueries({ queryKey: ['task', updated.id] });
    },
  });
};

// --- Delete task ---
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'cursor'] });
    },
  });
};
