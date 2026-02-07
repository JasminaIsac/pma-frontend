// utils/filterHelpers.ts
import { TaskWithRelations, Project, User } from 'schemas';
import { toISODate } from './dateHelpers';

export type FilterEntity = 'task' | 'project' | 'user';

export type TaskFilter = {
  status?: string;
  priority?: string;
};

export type ProjectFilter = {
  status?: string;
  categoryId?: string;
};

export type UserFilter = {
  role?: string;
};

export function filterItems(
  items: TaskWithRelations[],
  type: 'task',
  filter: TaskFilter
): TaskWithRelations[];

export function filterItems(
  items: Project[],
  type: 'project',
  filter: ProjectFilter
): Project[];

export function filterItems(
  items: User[],
  type: 'user',
  filter: UserFilter
): User[];

export function filterItems(
  items: any[],
  type: FilterEntity,
  filter: Record<string, string | undefined>
): any[] {
  if (!items || items.length === 0) return [];

  return items.filter(item => {
    switch (type) {
      case 'task':
        return (!filter.status || item.status?.toLowerCase() === filter.status.toLowerCase()) &&
               (!filter.priority || item.priority?.toLowerCase() === filter.priority.toLowerCase());

      case 'project':
        return (!filter.status || item.status?.toLowerCase() === filter.status.toLowerCase()) &&
               (!filter.categoryId || item.categoryId === filter.categoryId);

      case 'user':
        return (!filter.role || item.role?.toLowerCase() === filter.role.toLowerCase());

      default:
        return true;
    }
  });
}

export const filterTasksByDate = (tasks: TaskWithRelations[], selectedDate: string): TaskWithRelations[] => {
  return tasks.filter(task => toISODate(task.deadline) === selectedDate);
};
