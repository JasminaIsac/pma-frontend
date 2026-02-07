import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { textPresets, colors } from '@theme/index';
import { TaskWithRelations } from 'schemas';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: TaskWithRelations[];
}

export const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
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
          <Text style={[textPresets.noData, {color: colors.text.secondary}]}>No tasks added</Text>
        </View>
      )}
      scrollEnabled={false}
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