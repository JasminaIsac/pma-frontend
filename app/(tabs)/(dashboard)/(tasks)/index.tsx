import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTasksByAssigneeId } from '@hooks/queries/useTasks';
import { TaskList, DaysCarousel, CalendarModal, LoadingIndicator } from '@components/index';
import { colors, textPresets } from '@theme/index';
import { filterTasksByDate, getTaskCountsByDate, toISODate } from '@utils/index';
import { TaskWithRelations } from 'schemas';
import { useMe } from '@hooks/queries/useMe';

const AllTasksScreen = () => {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: tasks = [], isLoading: tasksLoading, isError } = useTasksByAssigneeId(user?.id!);

  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState<string>(
    toISODate(new Date())
  );
  const [isCalendarVisible, setCalendarVisible] = useState<boolean>(false);

  const filteredTasks = useMemo<TaskWithRelations[]>(() => {
    return filterTasksByDate(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const taskCounts = useMemo(() => {
    return getTaskCountsByDate(tasks);
  }, [tasks]);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setCalendarVisible(true)} style={{ marginRight: 12 }}>
          <Ionicons name="calendar-outline" size={28} color={colors.text.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if(userLoading || tasksLoading) return <LoadingIndicator />

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={textPresets.noData}>Failed to load tasks.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DaysCarousel
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <View style={styles.taskSection}>
        <Text style={[textPresets.headerLarge, { marginVertical: 10 }]}>
          Tasks for{' '}
          <Text style={{ color: colors.text.accentOrange }}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </Text>

        <TaskList tasks={filteredTasks} />
      </View>

      <CalendarModal
        isCalendarVisible={isCalendarVisible}
        setCalendarVisible={setCalendarVisible}
        setSelectedDate={setSelectedDate}
        taskCounts={taskCounts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  taskSection: {
    padding: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllTasksScreen;
