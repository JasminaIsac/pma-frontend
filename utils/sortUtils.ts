// utils/sortHelpers.ts

import {
  TaskPriority,
  TaskStatus,
  TaskWithRelations,
  Project,
  ProjectMember,
  User,
  UserRole,
  ProjectStatus,
  Conversation,
} from 'schemas';

/* ────────────────────────────────
   SORT TYPES
──────────────────────────────── */

export type SortEntity = 'task' | 'project';

export type TaskSortMethod =
  | 'default'
  | 'priority'
  | 'status'
  | 'deadline'
  | 'updatedAt'
  | 'createdAt';

export type ProjectSortMethod =
  | 'default'
  | 'name'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

/* ────────────────────────────────
   ORDER MAPS
──────────────────────────────── */

const priorityOrder: Record<TaskPriority, number> = {
  [TaskPriority.HIGH]: 1,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 3,
};

const statusOrder: Record<TaskStatus, number> = {
  [TaskStatus.NEW]: 1,
  [TaskStatus.IN_PROGRESS]: 2,
  [TaskStatus.PAUSED]: 3,
  [TaskStatus.RETURNED]: 4,
  [TaskStatus.TO_CHECK]: 5,
  [TaskStatus.COMPLETED]: 6,
};

const projectStatusOrder: Record<Project['status'], number> = {
  [ProjectStatus.NEW]: 1,
  [ProjectStatus.IN_PROGRESS]: 2,
  [ProjectStatus.COMPLETED]: 3,
};


const roleOrder: Record<string, number> = {
  root: 1,
  admin: 2,
  project_manager: 3,
  developer: 4,
};

/* ────────────────────────────────
   MAIN SORT HELPER (OVERLOADS)
──────────────────────────────── */

export function sortItems(
  items: TaskWithRelations[],
  type: 'task',
  method: TaskSortMethod
): TaskWithRelations[];

export function sortItems(
  items: Project[],
  type: 'project',
  method: ProjectSortMethod
): Project[];

export function sortItems(
  items: TaskWithRelations[] | Project[],
  type: SortEntity,
  method: TaskSortMethod | ProjectSortMethod
) {

  if (!items || !Array.isArray(items)) return [];
  
  const arr = [...items];

  /* ───────── TASKS ───────── */
  if (type === 'task') {
    const tasks = arr as TaskWithRelations[];

    switch (method) {
      case 'priority':
        return tasks.sort(
          (a, b) =>
            (priorityOrder[a.priority] ?? 99) -
            (priorityOrder[b.priority] ?? 99)
        );

      case 'status':
        return tasks.sort(
          (a, b) =>
            (statusOrder[a.status] ?? 99) -
            (statusOrder[b.status] ?? 99)
        );

      case 'deadline':
        return tasks.sort(
          (a, b) =>
            new Date(a.deadline ?? 0).getTime() -
            new Date(b.deadline ?? 0).getTime()
        );

      case 'updatedAt':
        return tasks.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
        );

      case 'createdAt':
        return tasks.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      default:
        return tasks;
    }
  }

  /* ───────── PROJECTS ───────── */
  const projects = arr as Project[];

  switch (method) {
    case 'name':
      return projects.sort((a, b) => a.name.localeCompare(b.name));

    case 'status':
      return projects.sort(
        (a, b) =>
          (projectStatusOrder[a.status] ?? 99) -
          (projectStatusOrder[b.status] ?? 99)
      );

    case 'updatedAt':
      return projects.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

    case 'createdAt':
      return projects.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    default:
      return projects;
  }
}

export const completedLast = <T extends { status?: string }>(
  items: T[],
  completedStatus = ProjectStatus.COMPLETED || TaskStatus.COMPLETED
): T[] => {
  return [...items].sort((a, b) => {
    if (a.status === completedStatus && b.status !== completedStatus) return 1;
    if (a.status !== completedStatus && b.status === completedStatus) return -1;
    return 0;
  });
};


/* ────────────────────────────────
   PROJECT MEMBERS SORT
──────────────────────────────── */

export const sortProjectMembers = (
  members: ProjectMember[],
  managerId?: string
): ProjectMember[] => {
  return [...members].sort((a, b) => {
    if (managerId) {
      if (a.userId === managerId) return -1;
      if (b.userId === managerId) return 1;
    }

    if (
      a.userRole === UserRole.PROJECT_MANAGER &&
      b.userRole === UserRole.DEVELOPER
    )
      return -1;

    if (
      a.userRole === UserRole.DEVELOPER &&
      b.userRole === UserRole.PROJECT_MANAGER
    )
      return 1;

    return a.user.name.localeCompare(b.user.name);
  });
};

/* ────────────────────────────────
   USERS SORT BY ROLE
──────────────────────────────── */

export const sortUsersByRole = (users: User[]): User[] => {
  return [...users].sort((a, b) => {
    const roleA = roleOrder[a.role?.toLowerCase() ?? ''] ?? 99;
    const roleB = roleOrder[b.role?.toLowerCase() ?? ''] ?? 99;
    return roleA - roleB;
  });
};


export const sortConversationsByUpdatedAt = (
  conversations: Conversation[]
): Conversation[] => {
  return [...conversations].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
  );
};
