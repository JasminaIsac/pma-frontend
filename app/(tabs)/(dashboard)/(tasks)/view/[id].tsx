import React, { useLayoutEffect }  from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { CustomButton, LoadingIndicator, Tag, MetaRow } from '@components/index';
import { textPresets, colors } from '@theme/index';
import { getPriorityTagData, getStatusTagData, formatDate, formatDateWithSuffix } from '@utils/index';
import { useTask, useUpdateTask } from '@hooks/queries/useTasks';
import { useProject } from '@hooks/queries/useProjects';
import { useUser } from '@hooks/queries/useUsers';
import { useMe } from '@hooks/queries/useMe';
import { TaskStatus, UserRole } from 'schemas';
import useToastNotification from '@hooks/useToastNotification';

const ViewTaskScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter(); 
  const navigation = useNavigation();

  const { data: user, isLoading: loadingUser } = useMe();
  const { data: task, isLoading: loadingTask } = useTask(id!);
  const { data: project } = useProject(task?.projectId!);
  const { data: assignedUser } = useUser(task?.assignedTo!);
  const { mutate: updateStatus, isPending } = useUpdateTask();

  const { showSuccess, showError } = useToastNotification();

  useLayoutEffect(() => {
    if (!task || user?.role === UserRole.DEVELOPER) return;
    navigation.setOptions({
      headerRight: () => (    
        <TouchableOpacity onPress={() => router.push(`/(tasks)/edit/${task.id}`)} >
          <Ionicons name="pencil" size={22} color={colors.darkBlue} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, task?.id, user?.role, router]);

  const handleTaskStatusChange = (newStatus: TaskStatus) => {
    if (!task) return;

    console.log('Updating task status to:', newStatus);

    updateStatus(
      { id: task.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          showSuccess('Success', `Task marked as ${newStatus}`);
        },
        onError: (err: any) => {
          showError('Error', err.response?.data?.message || 'Failed to update status');
        }
      }
    );
  };

  if(!task){
    return null
  }

  const deadlineLabel = formatDateWithSuffix(task.deadline);

  const createdAt = formatDate(task.createdAt);
  const updatedAt = formatDate(task.updatedAt);

  const statusData = getStatusTagData(task.status);
  const priorityData = getPriorityTagData(task.priority);

  const getAvailableStatusActions = () => {
    const actions: { label: string; value: TaskStatus, color?: string }[] = [];
    const isAssignedDeveloper = user?.role === UserRole.DEVELOPER && user.id === task.assignedTo;
    const isManagement = user?.role !== UserRole.DEVELOPER;

    // --- Logica pentru DEVELOPER ---
    if (isAssignedDeveloper) {
      if (task.status === TaskStatus.IN_PROGRESS) {
        actions.push({ label: 'To Check', value: TaskStatus.TO_CHECK, color: colors.taskStatus[TaskStatus.TO_CHECK].color });
        actions.push({ label: 'Paused', value: TaskStatus.PAUSED, color: colors.taskStatus[TaskStatus.PAUSED].color });
      } 
      else if (task.status === TaskStatus.PAUSED || task.status === TaskStatus.RETURNED) {
        actions.push({ label: 'In Progress', value: TaskStatus.IN_PROGRESS, color: colors.taskStatus[TaskStatus.IN_PROGRESS].color });
        
        if (task.status === TaskStatus.RETURNED) {
          actions.push({ label: 'Paused', value: TaskStatus.PAUSED, color: colors.taskStatus[TaskStatus.PAUSED].color });
        }
      }
    }
    // --- Logica pentru MANAGEMENT (Admin/Root/PM) ---
    if (isManagement) {
      if (task.status === TaskStatus.TO_CHECK) {
        actions.push({ label: 'Completed', value: TaskStatus.COMPLETED, color: colors.taskStatus[TaskStatus.COMPLETED].color });
        actions.push({ label: 'Returned', value: TaskStatus.RETURNED, color: colors.taskStatus[TaskStatus.RETURNED].color });
      }
    }

    return actions;
  };

  const availableActions = getAvailableStatusActions();

  if (loadingUser || loadingTask) {
    return <LoadingIndicator />;
  }

  return (
    <LinearGradient
      colors={colors.violetBlueGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* --- Header section --- */}
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
              <MetaRow label="Created" value={createdAt} />
              <MetaRow label="Last Updated" value={updatedAt} />
            </View>
          </View>

          <View style={styles.taskDetailsRight}>
            <Ionicons name="time" size={42} color={colors.white} />
            <Text style={styles.deadline}>{deadlineLabel}</Text>
          </View>
        </View>

        {/* --- Description --- */}
        <View style={styles.descriptionContainer}>
          <Text style={textPresets.headerMedium}>Description</Text>

          {task.description ? (
            <Text style={textPresets.bodyMedium}>{task.description}</Text>
          ) : (
            <Text style={styles.noDescription}>No description</Text>
          )}

          {/* --- Status actions --- */}
          <View style={styles.actions}>
            {task.status === TaskStatus.COMPLETED ? (
              <CustomButton title="Task Completed" disabled />
            ) : (
              <>
                {availableActions.map((opt) => (
                  <CustomButton
                    key={opt.value}
                    title={`Mark as ${opt.label}`}
                    onPress={() => handleTaskStatusChange(opt.value)}
                    disabled={isPending}
                    style={[opt.color ? { backgroundColor: opt.color } : {}, styles.actionButton]}
                  />
                ))}
                
                {/* Mesaj informativ dacă nu are acțiuni disponibile */}
                {availableActions.length === 0 && (
                  <Text style={{ color: colors.text.secondary }}>
                    Waiting for {task.status === TaskStatus.TO_CHECK ? 'manager review' : 'developer action'}...
                  </Text>
                )}
              </>
            )}
          </View>
          
        </View>
      </ScrollView>
    </LinearGradient>
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
