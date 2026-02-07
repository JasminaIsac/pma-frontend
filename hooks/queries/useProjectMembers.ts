import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@api/user-to-project';
import { ID, User, ProjectMember, CreateUserToProjectDTO, UpdateUserToProjectDTO, Project, CursorResponse } from 'schemas';
import { useUsers } from '@hooks/queries/useUsers';

// --- Fetch project members ---
export const useProjectMembers = (projectId: ID) => {
  return useQuery<ProjectMember[]>({
    queryKey: ['project-members', projectId],
    queryFn: async () => {
      const res = await api.getProjectMembers(projectId);
      return res as unknown as ProjectMember[];
    },
    enabled: Boolean(projectId),
    staleTime: 1000 * 60,
  });
};

// --- Fetch projects by user ---
export const useUserProjects = (userId: ID) => {
  return useQuery<CursorResponse<Project>>({
    queryKey: ['user-projects', userId],
    queryFn: async () => {
      const res = await api.getUserProjects(userId);
      return res as unknown as CursorResponse<Project>;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

// --- Add member ---
export const useAddUserToProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserToProjectDTO) => {
      return await api.addUserToProject(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', variables.projectId],
      });
    },
  });
};

// --- Fetch available project users (non-members) ---
export const useAvailableProjectUsers = (projectId: ID) => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: members = [], isLoading: membersLoading } =
    useProjectMembers(projectId);

  const availableUsers = useMemo<User[]>(() => {
    if (!users.length) return [];

    const memberUserIds = new Set(
      members.map((m) => m.userId),
    );

    return users.filter(
      (user) => !memberUserIds.has(user.id),
    );
  }, [users, members]);

  return {
    data: availableUsers,
    isLoading: usersLoading || membersLoading,
  };
};

// --- Update member role ---
export const useUpdateUserProject = (projectId: ID) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: ID;
      data: UpdateUserToProjectDTO;
    }) => api.updateUserProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', projectId],
      });
    },
  });
};

// --- Remove member ---
export const useRemoveUserFromProject = (projectId: ID) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(relationId: ID) => await api.removeUserFromProject(relationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', projectId],
      });
    },
  });
};
