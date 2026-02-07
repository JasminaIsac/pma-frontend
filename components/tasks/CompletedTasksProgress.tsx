import React, { useMemo } from 'react';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useTasksByProjectId } from '@hooks/queries/useTasks';
import { colors as themeColors } from '@theme/index';
import { TaskStatus } from 'schemas';
import { LoadingIndicator } from '../ui';

interface ProgressColors {
  active: string;
  inActive: string;
}

interface CompletedTasksProgressProps {
  projectId: string;
  color?: ProgressColors;
}

const defaultColors: ProgressColors = {
  active: themeColors.mediumBlue,
  inActive: themeColors.lightBlue,
};

export const CompletedTasksProgress: React.FC<CompletedTasksProgressProps> = ({ projectId, color = defaultColors }) => {
  const { data: tasks = [], isLoading } = useTasksByProjectId(projectId);

  const percentComplete = useMemo(() => {
    if (!tasks.length) return 0;

    const completed = tasks.filter(
      (task) => task.status === TaskStatus.COMPLETED,
    ).length;

    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <CircularProgress
      value={isLoading ? 0 : percentComplete}
      radius={40}
      maxValue={100}
      duration={800}
      activeStrokeColor={color.active}
      inActiveStrokeColor={color.inActive}
      inActiveStrokeOpacity={0.4}
      progressValueColor={color.active}
      progressValueFontSize={18}
    />
  );
};