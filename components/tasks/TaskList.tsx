import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { textPresets, colors } from '@theme/index';
import { TaskWithRelations } from 'schemas';
import { TaskCard } from './TaskCard';
import { useTranslation } from 'react-i18next';

interface TaskListProps {
  tasks: TaskWithRelations[];
  scrollable?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, scrollable = true }) => {
  const { t } = useTranslation();

  if (!scrollable) {
    return (
      <View style={{ paddingBottom: 15 }}>
        {tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[textPresets.noData, { color: colors.text.secondary }]}>{t('tasks.noTasks')}</Text>
          </View>
        ) : (
          tasks.map(item => <TaskCard key={item.id} item={item} />)
        )}
      </View>
    );
  }

  return (
    <FlatList
      style={{ paddingBottom: 15 }}
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskCard item={item} />
      )}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={[textPresets.noData, { color: colors.text.secondary }]}>{t('tasks.noTasks')}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    padding: 20,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
