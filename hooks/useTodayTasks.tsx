import { useMemo } from 'react';
import { isToday } from '@utils/index';
import { Task, TaskStatus } from 'schemas';
import { useTasksByAssigneeId } from '@hooks/queries/useTasks';
import { useMe } from './queries/useMe';

export interface TodayTasksStats {
  todayTasks: Task[];
  completedTasks: number;
  totalTasks: number;
  percentage: number;
}

export const useTodayTasks = (): TodayTasksStats => {
  const { data: user } = useMe();
  const userId = user?.id;

  const { data: tasks = [] } = useTasksByAssigneeId(userId);

  const todayTasks = useMemo(
    () => tasks.filter(task => isToday(task.deadline)),
    [tasks]
  );

  const completedTasks = useMemo(
    () => todayTasks.filter(task => task.status === TaskStatus.COMPLETED).length,
    [todayTasks]
  );

  const totalTasks = todayTasks.length;

  const percentage = useMemo(
    () =>
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
    [completedTasks, totalTasks]
  );

  return {
    todayTasks,
    completedTasks,
    totalTasks,
    percentage,
  };
};
