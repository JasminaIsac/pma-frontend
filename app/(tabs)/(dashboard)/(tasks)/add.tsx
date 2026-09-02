import { useMemo } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
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
import { useTranslation } from 'react-i18next';

type TaskFormValues = {
  name: string;
  description?: string;
  priority: TaskPriority;
  projectId: string;
  assignedTo: string;
  deadline: string;
};

const AddTaskScreen: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const defaultProjectId = projectId ? String(projectId) : undefined;
  const router = useRouter();

  const taskSchema = useMemo(() => z.object({
    name: z.string().min(3, t('validation.titleMinChars', { count: 3 })),
    description: z.string().optional(),
    priority: z.nativeEnum(TaskPriority),
    projectId: z.string().min(1, t('validation.projectRequired')),
    assignedTo: z.string().min(1, t('validation.developerRequired')),
    deadline: z.string().min(1, t('validation.deadlineRequired')),
  }), [t]);

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
    addTask({ ...data }, {
      onSuccess: () => {
        showSuccess('Success', t('tasks.added'));
        router.back();
      },
      onError: () => {
        showError('Error', t('tasks.failedAdd'));
      },
    });
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
          label={t('tasks.project')}
          placeholder={t('tasks.selectProject')}
          items={projects?.map(p => ({ label: p.name, value: p.id })) ?? []}
          error={errors.projectId?.message}
        />

        <CustomInput
          control={control}
          name="name"
          label={t('tasks.name')}
          placeholder={t('tasks.name')}
          error={errors.name?.message}
        />

        <CustomInput
          control={control}
          name="description"
          label={t('tasks.description')}
          placeholder={t('tasks.description')}
          multiline
          error={errors.description?.message}
        />

        {loadingUsers ? (
          <LoadingIndicator />
        ) : projectMembersDevelopers.length === 0 ? (
          <Text style={[textPresets.noData, { color: colors.text.secondary, marginBottom: 10 }]}>
            {t('tasks.noDevelopers')}
          </Text>
        ) : (
          <LabeledPicker
            control={control}
            name="assignedTo"
            label={t('tasks.developer')}
            placeholder={t('tasks.selectDeveloper')}
            items={projectMembersDevelopers.map(dev => ({ label: dev.user.name, value: dev.user.id }))}
            error={errors.assignedTo?.message}
          />
        )}

        <LabeledPicker
          control={control}
          name="priority"
          label={t('tasks.priority')}
          placeholder={t('tasks.priority')}
          items={[
            { label: t('tasks.priorityHigh'), value: TaskPriority.HIGH },
            { label: t('tasks.priorityMedium'), value: TaskPriority.MEDIUM },
            { label: t('tasks.priorityLow'), value: TaskPriority.LOW },
          ]}
          error={errors.priority?.message}
        />

        <SelectDeadlineInput
          control={control}
          name="deadline"
          error={errors.deadline?.message}
        />

        <CustomButton title={t('tasks.create')} onPress={handleSubmit(onSubmit)} disabled={adding} />
        <CustomButton title={t('common.cancel')} type="secondary" onPress={() => router.back()} />

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
  contentContainer: { paddingBottom: 20 },
});

export default AddTaskScreen;
