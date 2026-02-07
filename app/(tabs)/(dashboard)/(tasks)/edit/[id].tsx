import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Alert, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "@theme/colors";
import { CustomInput, LabeledPicker, CustomButton, SelectDeadlineInput, LoadingIndicator } from "@components/index";
import { useTask, useUpdateTask, useDeleteTask } from "@hooks/queries/useTasks";
import { useProject } from "@hooks/queries/useProjects";
import { useAvailableProjectUsers } from "@hooks/queries/useProjectMembers";
import { useToastNotification } from "@hooks/useToastNotification";
import { TaskStatus, TaskPriority, UserRole, User } from "schemas";

const taskSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  assignedTo: z.string().min(1, "Select a developer"),
  priority: z.nativeEnum(TaskPriority),
  deadline: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const EditTaskScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { showSuccess, showError } = useToastNotification()
  
  const { data: task, isLoading: loadingTask } = useTask(id!);
  const { data: project } = useProject(task?.projectId!);
  const { data: availableDevs, isLoading:loadingDevs} = useAvailableProjectUsers(project?.id!);
  const availableDevelopers = useMemo(() => availableDevs?.filter(dev => dev.role === UserRole.DEVELOPER), [availableDevs]);

  const { mutate: updateTaskMutate, isPending: updating } = useUpdateTask();
  const { mutate: deleteTaskMutate, isPending: deleting } = useDeleteTask();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.NEW,
      assignedTo: "",
      priority: TaskPriority.MEDIUM,
      deadline: "",
    },
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.name,
        description: task.description ?? "",
        status: task.status,
        assignedTo: task.assignedTo ?? "",
        priority: task.priority,
        deadline: task.deadline ?? "",
      });
    }
  }, [task, reset]);


  const onSave = async (data: TaskFormValues) => {
    if (!task) return;
    updateTaskMutate(
      { id: task.id, data },
      {
        onSuccess: () => {
          showSuccess("Success", "Task updated successfully");
          router.back();
        },
        onError: () => showError("Error", "Failed to update task"),
      }
    );
  };

  const onDelete = async () => {
    if (!task) return;
    Alert.alert("Confirm", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTaskMutate(task.id, {
            onSuccess: () => {
              showSuccess("Deleted", "Task deleted successfully");
              router.push(`/projects/view/${task.projectId}`);
            },
            onError: () => showError("Error", "Failed to delete task"),
          });
        },
      },
    ]);
  };

  if(!task) return null;

  if (loadingTask || loadingDevs) {
    return <LoadingIndicator />
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <CustomInput
          control={control}
          name="title"
          label="Title"
          placeholder="Task Name"
          error={errors.title?.message}
        />

        <CustomInput
          control={control}
          name="description"
          label="Description"
          placeholder="Task Description"
          multiline
          error={errors.description?.message}
        />

        <LabeledPicker
          control={control}
          name="status"
          label="Status"
          placeholder="Select status"
          items={[
            { label: "Returned", value: TaskStatus.RETURNED },
            { label: "Completed", value: TaskStatus.COMPLETED },
          ]}
          error={errors.status?.message}
        />

        {availableDevelopers?.length > 0 && (
          <LabeledPicker
            control={control}
            name="assignedTo"
            label="Assigned to"
            placeholder="Select developer"
            items={availableDevelopers.map((dev: User) => ({ label: dev.name, value: dev.id }))}
            error={errors.assignedTo?.message}
          />
        )}

        <LabeledPicker
          control={control}
          name="priority"
          label="Priority"
          placeholder="Select priority"
          items={[
            { label: "High", value: TaskPriority.HIGH },
            { label: "Medium", value: TaskPriority.MEDIUM },
            { label: "Low", value: TaskPriority.LOW },
          ]}
          error={errors.priority?.message}
        />

        <SelectDeadlineInput
          control={control}
          name="deadline"
          error={errors.deadline?.message}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <CustomButton title="Delete" type="delete" onPress={onDelete} style={{ flex: 1 }} disabled={deleting} />
          <CustomButton title="Save" onPress={handleSubmit(onSave)} style={{ flex: 1 }} disabled={updating} />
        </View>

        <CustomButton title="Cancel" type="secondary" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  contentContainer: { padding: 20, paddingBottom: 15 },
});

export default EditTaskScreen;
