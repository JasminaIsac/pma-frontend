export type MotivationalKey = 'noTasks' | 'start' | 'goodStart' | 'halfway' | 'almostDone' | 'completed';

export const getMotivationalKey = (percentage: number, hasTasks: boolean): MotivationalKey => {
  if (!hasTasks) return 'noTasks';
  if (percentage === 0) return 'start';
  if (percentage <= 30) return 'goodStart';
  if (percentage < 75) return 'halfway';
  if (percentage < 100) return 'almostDone';
  return 'completed';
};
