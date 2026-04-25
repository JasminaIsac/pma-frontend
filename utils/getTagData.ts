import { colors } from '@theme/colors';
import { TaskPriority } from 'schemas';

interface TagData {
  title: string;
  color: string;
  textColor?: string;
}

export const getPriorityTagData = (priority?: string) => {
  if (!priority) return { title: 'Unknown', color: '#95a5a6', textColor: '#fff' };

  const key = priority as TaskPriority;
  const data = colors.priority[key];

  return data
    ? { title: data.label, color: data.color, textColor: '#fff' }
    : { title: priority, color: '#95a5a6', textColor: '#fff' };
};

export const getStatusTagData = (status?: string): TagData => {
  if (!status) {
    return { title: 'Unknown', color: '#95a5a6', textColor: '#fff' };
  }

  const key = status as keyof typeof colors.taskStatus;
  const data = colors.taskStatus[key];

  return data
    ? { title: data.label, color: data.color, textColor: '#fff' }
    : { title: status, color: '#95a5a6', textColor: '#fff' };
};