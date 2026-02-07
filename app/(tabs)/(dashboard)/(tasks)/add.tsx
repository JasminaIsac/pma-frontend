import { useMemo } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text, ToastAndroid } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CustomInput, CustomButton, LabeledPicker, SelectDeadlineInput, LoadingIndicator } from '@components/index';
import { colors, textPresets } from '@theme/index';
import { TaskPriority, UserRole } from 'schemas';
import { useProjects } from '@hooks/queries/useProjects';
import { useProjectMembers } from '@hooks/queries/useProjectMembers';
import { useAddTask } from '@hooks/queries/useTasks';
import useToastNotification from '@hooks/useToastNotification';

const taskSchema = z.object({
  name: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  projectId: z.string().min(1, 'Project is required'),
  assignedTo: z.string().min(1, 'Assigned developer is required'),
  deadline: z.string().min(1, 'Deadline is required'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const AddTaskScreen: React.FC = () => {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const defaultProjectId = projectId ? String(projectId) : undefined;

  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId: defaultProjectId ?? '',
      name: '',
      description: '',
      priority: TaskPriority.MEDIUM,
      assignedTo: '',
      deadline: '',
    },
  });

  const selectedProjectId = watch('projectId');
  const { showSuccess, showError } = useToastNotification();

  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: projectMembers, isLoading: loadingUsers } = useProjectMembers(selectedProjectId);
  const { mutate: addTask, isPending: adding } = useAddTask();

  const projectMembersDevelopers = useMemo(
    () => projectMembers?.filter(u => u.userRole === UserRole.DEVELOPER) ?? [],
    [projectMembers],
  );

  const onSubmit = async (data: TaskFormValues) => {
    addTask({...data,},
      {
        onSuccess: () => {
          showSuccess('Success', 'Task added successfully');

          if (defaultProjectId) {
            router.replace({
              pathname: '/(tabs)/(projects)/view/[id]',
              params: { id: defaultProjectId }
            });
          } else {
            router.back();
          }
        },
        onError: (err) => {
          console.error(err);
          if(Platform.OS === 'android') ToastAndroid.show('Failed to add task', ToastAndroid.LONG)
          else showError('Failed to add task', 'Something went wrong: ' + err.message);
        }
      },
    );
  };

  if (loadingProjects || loadingUsers) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">

        <LabeledPicker
          control={control}
          name="projectId"
          label="Project"
          placeholder="Select a project"
          items={projects?.map(p => ({
            label: p.name,
            value: p.id,
          })) ?? []}
          error={errors.projectId?.message}
        />

        <CustomInput
          control={control}
          name="name"
          label="Task name"
          placeholder="Task name..."
          error={errors.name?.message}
        />

        <CustomInput
          control={control}
          name="description"
          label="Description"
          placeholder="Task description..."
          multiline
          error={errors.description?.message}
        />

        {loadingUsers ? (
          <LoadingIndicator />
        ) : projectMembersDevelopers.length === 0 ? (
          <Text style={[textPresets.noData, { color: colors.text.secondary, marginBottom: 10 }]}>
            No developers available in this project.
          </Text>
        ) : (
          <LabeledPicker
            control={control}
            name="assignedTo"
            label="Developer"
            placeholder="Select developer"
            items={projectMembersDevelopers.map(dev => ({ label: dev.user.name, value: dev.user.id }))}
            error={errors.assignedTo?.message}
          />
        )}

        <LabeledPicker
          control={control}
          name="priority"
          label="Priority"
          placeholder="Select priority"
          items={[
            { label: 'High', value: TaskPriority.HIGH },
            { label: 'Medium', value: TaskPriority.MEDIUM },
            { label: 'Low', value: TaskPriority.LOW },
          ]}
          error={errors.priority?.message}
        />

        <SelectDeadlineInput
          control={control}
          name="deadline"
          error={errors.deadline?.message}
        />

        <CustomButton title="Create" onPress={handleSubmit(onSubmit)} disabled={adding} />
        <CustomButton title="Cancel" type="secondary" onPress={() => router.back()} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    paddingBottom: 20,
  },
});

export default AddTaskScreen;