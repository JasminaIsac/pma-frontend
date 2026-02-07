import { TaskWithRelations } from 'schemas';
import { toISODate } from './dateHelpers';

export const getTaskCountsByDate = (tasks: TaskWithRelations[]): Record<string, number> => {
  return tasks.reduce((counts: Record<string, number>, task) => {
    const date = toISODate(task.deadline);
    if (!date) return counts;
    counts[date] = (counts[date] || 0) + 1;
    return counts;
  }, {});
};
