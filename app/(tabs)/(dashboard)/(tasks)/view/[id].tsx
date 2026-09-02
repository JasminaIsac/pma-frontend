import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useLocalSearchParams, useSegments } from 'expo-router';
import { CustomButton, LoadingIndicator, Tag, MetaRow } from '@components/index';
import { textPresets, colors } from '@theme/index';
import { getPriorityTagData, getStatusTagData, formatDate, formatDateWithSuffix } from '@utils/index';
import { useTask, useUpdateTask } from '@hooks/queries/useTasks';
import { useProject } from '@hooks/queries/useProjects';
import { useUser } from '@hooks/queries/useUsers';
import { useMe } from '@hooks/queries/useMe';
import { TaskStatus, UserRole } from 'schemas';
import useToastNotification from '@hooks/useToastNotification';
import { useTranslation } from 'react-i18next';

const ViewTaskScreen: React.FC = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const segments = useSegments();
  const isInProjects = segments.some(s => s === '(projects)');

  const { data: user, isLoading: loadingUser } = useMe();
  const { data: task, isLoading: loadingTask } = useTask(id!);
  const { data: project } = useProject(task?.projectId ?? '');
  const { data: assignedUser } = useUser(task?.assignedTo ?? '');
  const { mutate: updateStatus, isPending } = useUpdateTask();

  const { showSuccess, showError } = useToastNotification();

  const handleTaskStatusChange = (newStatus: TaskStatus) => {
    if (!task) return;

    updateStatus(
      { id: task.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          showSuccess('Success', t('tasks.updated'));
        },
        onError: (err: any) => {
          showError('Error', err.response?.data?.message || t('tasks.failedUpdate'));
        }
      }
    );
  };

  if (loadingUser || loadingTask) {
    return <LoadingIndicator />;
  }

  if (!task) return null;

  const deadlineLabel = formatDateWithSuffix(task.deadline);

  const createdAt = formatDate(task.createdAt);
  const updatedAt = formatDate(task.updatedAt);

  const statusData = getStatusTagData(task.status);
  const priorityData = getPriorityTagData(task.priority);

  const editPath = isInProjects
    ? { pathname: '/(tabs)/(projects)/task/edit/[id]', params: { id: task.id } } as any
    : { pathname: '/(tabs)/(dashboard)/(tasks)/edit/[id]', params: { id: task.id } } as any;

  const getAvailableStatusActions = () => {
    const actions: { label: string; value: TaskStatus, color?: string }[] = [];
    const isAssignedDeveloper = user?.role === UserRole.DEVELOPER && user.id === task.assignedTo;
    const isManagement = user?.role !== UserRole.DEVELOPER;

    if (isAssignedDeveloper) {
      if (task.status === TaskStatus.NEW || task.status === TaskStatus.PAUSED || task.status === TaskStatus.RETURNED) {
        actions.push({ label: t('tasks.statusInProgress'), value: TaskStatus.IN_PROGRESS, color: colors.taskStatus[TaskStatus.IN_PROGRESS].color });
        if (task.status === TaskStatus.RETURNED) {
          actions.push({ label: t('tasks.statusPaused'), value: TaskStatus.PAUSED, color: colors.taskStatus[TaskStatus.PAUSED].color });
        }
      } else if (task.status === TaskStatus.IN_PROGRESS) {
        actions.push({ label: t('tasks.statusToCheck'), value: TaskStatus.TO_CHECK, color: colors.taskStatus[TaskStatus.TO_CHECK].color });
        actions.push({ label: t('tasks.statusPaused'), value: TaskStatus.PAUSED, color: colors.taskStatus[TaskStatus.PAUSED].color });
      }
    }

    if (isManagement) {
      if (task.status === TaskStatus.TO_CHECK) {
        actions.push({ label: t('tasks.statusCompleted'), value: TaskStatus.COMPLETED, color: colors.taskStatus[TaskStatus.COMPLETED].color });
        actions.push({ label: t('tasks.statusReturned'), value: TaskStatus.RETURNED, color: colors.taskStatus[TaskStatus.RETURNED].color });
      }
    }

    return actions;
  };

  const availableActions = getAvailableStatusActions();

  return (
    <>
      {user?.role !== UserRole.DEVELOPER && (
        <Stack.Screen
          options={{
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push(editPath)}>
                <Ionicons name="pencil" size={22} color={colors.darkBlue} />
              </TouchableOpacity>
            ),
          }}
        />
      )}
      <LinearGradient
        colors={colors.violetBlueGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.taskDetails}>
            <View style={styles.taskDetailsLeft}>

              <View style={styles.tagsContainer}>
                <Tag
                  title={statusData.title}
                  backgroundColor={statusData.color}
                  textColor="#fff"
                />
                <Tag
                  title={priorityData.title}
                  backgroundColor={priorityData.color}
                  textColor="#fff"
                />
                {project && (
                  <Tag
                    title={project.name}
                    backgroundColor={colors.lightBlue}
                    textColor={colors.darkBlue}
                  />
                )}
              </View>

              <Text style={[textPresets.headerLarge, { color: colors.white }]}>
                {task.name}
              </Text>

              {assignedUser && (
                <View style={styles.membersContainer}>
                  <Ionicons
                    name="person"
                    size={16}
                    color={colors.lightOrange}
                  />
                  <Text
                    style={[
                      textPresets.bodyMedium,
                      { color: colors.lightOrange },
                    ]}
                  >
                    {assignedUser.name}
                  </Text>
                </View>
              )}

              <View style={styles.meta}>
                <MetaRow label={t('common.created')} value={createdAt} />
                <MetaRow label={t('common.lastUpdated')} value={updatedAt} />
              </View>
            </View>

            <View style={styles.taskDetailsRight}>
              <Ionicons name="time" size={42} color={colors.white} />
              <Text style={styles.deadline}>{deadlineLabel}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={textPresets.headerMedium}>{t('tasks.description')}</Text>

            {task.description ? (
              <Text style={textPresets.bodyMedium}>{task.description}</Text>
            ) : (
              <Text style={styles.noDescription}>{t('tasks.noDescription')}</Text>
            )}

            <View style={styles.actions}>
              {task.status === TaskStatus.COMPLETED ? (
                <CustomButton title={t('tasks.taskCompleted')} disabled />
              ) : (
                <>
                  {availableActions.map((opt) => (
                    <CustomButton
                      key={opt.value}
                      title={`${t('tasks.markAs')} ${opt.label}`}
                      onPress={() => handleTaskStatusChange(opt.value)}
                      disabled={isPending}
                      style={[opt.color ? { backgroundColor: opt.color } : {}, styles.actionButton]}
                    />
                  ))}
                  {availableActions.length === 0 && (
                    <Text style={{ color: colors.text.secondary }}>
                      {task.status === TaskStatus.TO_CHECK ? t('tasks.waitingManager') : t('tasks.waitingDeveloper')}
                    </Text>
                  )}
                </>
              )}
            </View>

          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 20,
  },
  taskDetailsLeft: {
    flex: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  descriptionContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  taskDetailsRight: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 5,
  },
  deadline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  meta: {
    flexDirection: 'column',
    gap: 5,
  },
  noDescription: {
    fontSize: 16,
    color: colors.text.disabled,
  },
  actionButton: {
    width: '48%',
  },
});

export default ViewTaskScreen;
