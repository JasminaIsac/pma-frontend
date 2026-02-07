import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import {
  getAllProjects,
  getProjectsCursor,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsCountByCategory,
} from '@api/projects';
import { Project, ID, CreateProjectDTO, UpdateProjectDTO, CursorResponse, ProjectCountByCategory } from 'schemas';


// --- Fetch all projects ---
export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getAllProjects();
      return res as unknown as Project[];
    },
    staleTime: 1000 * 60, // 1 min caching
    retry: 1,
  });
};

export type UseProjectsCursorData = InfiniteData<CursorResponse<Project>>;

// --- Fetch projects with cursor pagination ---
export const useProjectsCursor = (limit = 10) => {
  return useInfiniteQuery<
    CursorResponse<Project>,   // TQueryFnData
    Error,                     // TError
    CursorResponse<Project>,   // TData
    readonly unknown[]         // TQueryKey
  >({
    queryKey: ['projects', 'cursor', limit],
    queryFn: async ({ pageParam }) => {
      const res = await getProjectsCursor(limit, pageParam as string | undefined);
      return res as unknown as CursorResponse<Project>;
    },
    getNextPageParam: (lastPage) => lastPage?.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60,
    initialPageParam: undefined,
  });
};

// --- Fetch single project ---
export const useProject = (id: ID) => {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await getProjectById(id);
      return res as unknown as Project;
    },
    enabled: !!id,
  });
};

export const useProjectCountByCategory = () => {
  return useQuery<ProjectCountByCategory[]>({
    queryKey: ['projects', 'count', 'category'],
    queryFn: async () => {
      const res = await getProjectsCountByCategory();
      return res as unknown as ProjectCountByCategory[];
    },
  });
};

// --- Add project ---
export const useAddProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(data: CreateProjectDTO) => {
      const res = await createProject(data);
      return res as unknown as Project;
    },
    onSuccess: (newProject) => {
      // Actualizează lista projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'cursor'] });
    },
  });
};

// --- Update project ---
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: ID; data: UpdateProjectDTO }) =>
      updateProject(id, data),
    onSuccess: (res) => {
      const updatedProject = res as unknown as Project;
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'cursor'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
    },
  });
};

// --- Delete project ---
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ID) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'cursor'] });
    },
  });
};
