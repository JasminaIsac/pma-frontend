import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { ID, User, UserRole, TaskWithRelations, TaskStatus } from 'schemas';
import { filterItems, sortItems, TaskSortMethod } from '@utils/index';
import { TaskList } from './TaskList';
import { SortSelect, FilterSelect } from '../ui';

interface ProjectTasksProps {
  projectId: ID;
  user?: User | null;
  tasks: TaskWithRelations[];
  onTaskUpdate?: (task: TaskWithRelations) => void;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = React.memo(({
  tasks,
  projectId,
  user,
}) => {
  const router = useRouter();

  const [sortMethod, setSortMethod] =
    useState<TaskSortMethod>('default');

  const [filterStatus, setFilterStatus] =
    useState<TaskStatus | 'all'>('all');

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterItems(tasks, 'task', {
      status: filterStatus === 'all' ? undefined : filterStatus,
    });

    return sortItems(filtered, 'task', sortMethod);
  }, [tasks, filterStatus, sortMethod]);

  const handleAddTask = useCallback(() => {
    router.push({
      pathname: '/(tabs)/(tasks)/add',
      params: {
        projectId,
      },
    });
  }, [router, projectId]);

  const canAddTasks = user?.role !== UserRole.DEVELOPER;

  return (
    <View style={styles.tasksContainer}>
      <View style={styles.tasksHeader}>
        <Text style={textPresets.headerLarge}>Tasks</Text>

        <View style={styles.headerActions}>
            <SortSelect<'task'>
              type="task"
              data={tasks}
              selectedSort={sortMethod}
              onSortChange={setSortMethod}
            />

            <FilterSelect
              type="task"
              selectedFilter={filterStatus}
              onFilterChange={(value) =>
                setFilterStatus(value as TaskStatus | 'all')
              }
            />
          {canAddTasks && (
            <TouchableOpacity
              onPress={handleAddTask}
              style={styles.addButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add"
                size={24}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TaskList tasks={filteredAndSortedTasks} />
    </View>
  );
});

const styles = StyleSheet.create({
  tasksContainer: {
    padding: 12,
    paddingTop: 20,
    backgroundColor: colors.background.primary,
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    padding: 4,
  },
});