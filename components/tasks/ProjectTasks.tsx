import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { ID, User, UserRole, TaskWithRelations, TaskStatus } from 'schemas';
import { filterItems, sortItems, TaskSortMethod } from '@utils/index';
import { TaskList } from './TaskList';
import { SortSelect, FilterSelect } from '../ui';
import { useTranslation } from 'react-i18next';

interface ProjectTasksProps {
  projectId: ID;
  user?: User | null;
  tasks: TaskWithRelations[];
  hasDevelopers: boolean;
}

export const ProjectTasks: React.FC<ProjectTasksProps> = React.memo(({
  tasks,
  projectId,
  user,
  hasDevelopers,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

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
    if (!hasDevelopers) {
      Alert.alert(t('tasks.noDevelopers'), t('tasks.noDevelopersAlert'));
      return;
    }
    router.push({
      pathname: '/(tabs)/(projects)/task/add',
      params: { projectId },
    } as any);
  }, [router, projectId, hasDevelopers, t]);

  const canAddTasks = user?.role !== UserRole.DEVELOPER;

  return (
    <View style={styles.tasksContainer}>
      <View style={styles.tasksHeader}>
        <Text style={[textPresets.headerMedium, { marginBottom: 0 }]}>{t('tasks.title')}</Text>

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

      <TaskList tasks={filteredAndSortedTasks} scrollable={false} />
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
    gap: 4,
  },
});