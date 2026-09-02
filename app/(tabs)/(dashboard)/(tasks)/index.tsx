import { useState, useMemo, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks, useTasksByAssigneeId } from '@hooks/queries/useTasks';
import { TaskList, DaysCarousel, CalendarModal, LoadingIndicator } from '@components/index';
import { colors, textPresets } from '@theme/index';
import { filterTasksByDate, getTaskCountsByDate, toISODate } from '@utils/index';
import { TaskWithRelations, UserRole } from 'schemas';
import { useMe } from '@hooks/queries/useMe';
import { useTranslation } from 'react-i18next';

const AllTasksScreen = () => {
  const { t } = useTranslation();
  const { data: user, isLoading: userLoading } = useMe();

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.ROOT;

  const { data: allTasks = [], isLoading: allTasksLoading, isError: allTasksError } = useTasks(isAdmin);
  const { data: myTasks = [], isLoading: myTasksLoading, isError: myTasksError } = useTasksByAssigneeId(
    !isAdmin ? user?.id : undefined
  );

  const tasks = isAdmin ? allTasks : myTasks;
  const tasksLoading = isAdmin ? allTasksLoading : myTasksLoading;
  const isError = isAdmin ? allTasksError : myTasksError;

  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
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

  if (userLoading || tasksLoading) return <LoadingIndicator />;

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={textPresets.noData}>{t('tasks.failedLoad')}</Text>
      </View>
    );
  }

  const dateLabel = new Date(selectedDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <DaysCarousel
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      <View style={styles.taskSection}>
        <Text style={[textPresets.headerLarge, { marginVertical: 10 }]}>
          {t('tasks.tasksFor')}{' '}
          <Text style={{ color: colors.text.accentOrange }}>{dateLabel}</Text>
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
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllTasksScreen;
