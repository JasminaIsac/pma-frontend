import { Task, TaskStatus } from 'schemas';

export const determineProjectStatus = (tasks: Task[]): TaskStatus => {
  if (!tasks.length) return TaskStatus.NEW;

  let hasNew = false;
  let hasInProgress = false;
  let hasCompleted = false;

  for (const task of tasks) {
    if (task.status === TaskStatus.NEW) hasNew = true;
    else if ([TaskStatus.IN_PROGRESS, TaskStatus.PAUSED, TaskStatus.TO_CHECK].includes(task.status)) hasInProgress = true;
    else if (task.status === TaskStatus.COMPLETED) hasCompleted = true;

    // Early exit dacă deja știm că e IN_PROGRESS
    if ((hasNew || hasInProgress) && hasCompleted) return TaskStatus.IN_PROGRESS;
  }

  if (hasCompleted && !hasNew && !hasInProgress) return TaskStatus.COMPLETED;
  if (hasNew && !hasCompleted && !hasInProgress) return TaskStatus.NEW;
  return TaskStatus.IN_PROGRESS;
};

export const autoUpdateProjectStatus = async (
  tasks: Task[],
  projectId: string,
  updateProjectStatus: (id: string, status: TaskStatus) => Promise<void>
) => {
  if (tasks.length === 0) {
    await updateProjectStatus(projectId, TaskStatus.NEW);
    return;
  }

  const allCompleted = tasks.every(task => task.status === TaskStatus.COMPLETED);

  if (allCompleted) {
    await updateProjectStatus(projectId, TaskStatus.COMPLETED);
    return;
  }

  const hasActiveProgress = tasks.some(task =>
    [TaskStatus.IN_PROGRESS, TaskStatus.PAUSED, TaskStatus.TO_CHECK].includes(task.status)
  );

  if (hasActiveProgress) {
    await updateProjectStatus(projectId, TaskStatus.IN_PROGRESS);
  } else {
    await updateProjectStatus(projectId, TaskStatus.NEW);
  }
};
