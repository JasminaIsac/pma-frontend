import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { ConfirmModal } from "@components/modals/ConfirmModal";
import { useConfirmModal } from "@hooks/useConfirmModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@theme/colors";
import { CustomInput, LabeledPicker, CustomButton, SelectDeadlineInput, LoadingIndicator } from "@components/index";
import { useTask, useUpdateTask, useDeleteTask } from "@hooks/queries/useTasks";
import { useProject } from "@hooks/queries/useProjects";
import { useProjectMembers } from "@hooks/queries/useProjectMembers";
import { useToastNotification } from "@hooks/useToastNotification";
import { TaskPriority, UserRole } from "schemas";
import { useTranslation } from "react-i18next";

type TaskFormValues = {
  name: string;
  description?: string;
  assignedTo: string;
  priority: TaskPriority;
  deadline?: string;
};

const EditTaskScreen: React.FC = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { showSuccess, showError } = useToastNotification();

  const { data: task, isLoading: loadingTask, isError: taskError } = useTask(id || "");
  const { data: project, isLoading: loadingProject, isError: projectError } = useProject(task?.projectId || "");
  const { data: projectMembers, isLoading: loadingMembers } = useProjectMembers(project?.id || "");

  const availableDevelopers = useMemo(
    () => projectMembers?.filter(m => m.userRole === UserRole.DEVELOPER) ?? [],
    [projectMembers]
  );

  const { mutate: updateTaskMutate, isPending: updating } = useUpdateTask();
  const { mutate: deleteTaskMutate, isPending: deleting } = useDeleteTask();
  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const taskSchema = useMemo(() => z.object({
    name: z.string().min(3, t('validation.titleMinChars', { count: 3 })),
    description: z.string().optional(),
    assignedTo: z.string().min(1, t('validation.developerRequired')),
    priority: z.nativeEnum(TaskPriority),
    deadline: z.string().optional(),
  }), [t]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues: {
      name: "",
      description: "",
      assignedTo: "",
      priority: TaskPriority.MEDIUM,
      deadline: "",
    },
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        description: task.description ?? "",
        assignedTo: task.assignedTo ?? "",
        priority: task.priority,
        deadline: task.deadline ?? "",
      });
    }
  }, [task, reset]);

  useEffect(() => {
    if (taskError) {
      showError("Error", t('tasks.failedLoadTask'));
      router.back();
    }
  }, [taskError]);

  useEffect(() => {
    if (projectError) {
      showError("Error", t('tasks.failedLoadProject'));
    }
  }, [projectError]);

  const onSave = (data: TaskFormValues) => {
    if (!task) return;
    updateTaskMutate(
      { id: task.id, data },
      {
        onSuccess: () => {
          showSuccess("Success", t('tasks.updated'));
          router.back();
        },
        onError: () => showError("Error", t('tasks.failedUpdate')),
      }
    );
  };

  const onDelete = () => {
    if (!task) return;
    confirm({
      title: t('tasks.deleteTask'),
      message: t('tasks.deleteConfirm'),
      confirmLabel: t('common.delete'),
      onConfirm: () =>
        deleteTaskMutate(task.id, {
          onSuccess: () => {
            showSuccess('Success', t('tasks.deleted'));
            router.back();
            router.back();
          },
          onError: () => showError('Error', t('tasks.failedDelete')),
        }),
    });
  };

  if (loadingTask || loadingProject || loadingMembers) return <LoadingIndicator />;
  if (!task) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
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

        {availableDevelopers.length > 0 && (
          <LabeledPicker
            control={control}
            name="assignedTo"
            label={t('tasks.assignedTo')}
            placeholder={t('tasks.selectDeveloper')}
            items={availableDevelopers.map(m => ({ label: m.user.name, value: m.user.id }))}
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

        <View style={{ flexDirection: "row", gap: 10 }}>
          <CustomButton title={t('common.delete')} type="delete" onPress={onDelete} style={{ flex: 1 }} disabled={deleting} />
          <CustomButton title={t('common.save')} onPress={handleSubmit(onSave)} style={{ flex: 1 }} disabled={updating} />
        </View>

        <CustomButton title={t('common.cancel')} type="secondary" onPress={() => router.back()} />
      </ScrollView>
      <ConfirmModal {...confirmModalProps} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  contentContainer: { padding: 20, paddingBottom: 15 },
});

export default EditTaskScreen;
