import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, router } from 'expo-router';
import { useProject, useUpdateProject, useDeleteProject } from '@hooks/queries/useProjects';
import { useTasksByProjectId } from '@hooks/queries/useTasks';
import { useCategories } from '@hooks/queries/useCategories';
import { CustomInput, LabeledPicker, SelectDeadlineInput, CustomButton } from '@components/index';
import { colors } from '@theme/colors';
import { Category, UpdateProjectDTO, TaskStatus } from 'schemas';
import useToastNotification from '@hooks/useToastNotification';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  deadline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function EditProjectScreen () {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: tasks } = useTasksByProjectId(id ?? '');
  const { data: categories = [] } = useCategories();

  const { data: project, isLoading: loadingProject } = useProject(id ?? '');
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      deadline: '',
    },
  });

  const { showSuccess, showError } = useToastNotification();
  
  useEffect(() => {
     if (project) {
      setValue('name', project.name);
      setValue('description', project.description ?? '');
      setValue('categoryId', project.categoryId);
      setValue('deadline', project.deadline ?? '');
    }
  }, [project, setValue]);

  const checkCompleted = (): boolean => {
    if (!project) return false;
    return !tasks?.some((t) => t.status !== TaskStatus.COMPLETED);
  };

  const handleSave = async (data: ProjectFormData) => {
    if (!project) return;

    const payload: UpdateProjectDTO = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateProjectMutation.mutateAsync({ id: project.id, data: payload });
      showSuccess('Success', 'Project updated successfully');
      router.replace(`view/${project.id}`);
    } catch (err) {
      showError('Error', 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      await deleteProjectMutation.mutateAsync(project.id);
      showSuccess('Success', 'Project deleted successfully');
      router.replace('/(projects)');
    } catch (err) {
      showError('Error', 'Failed to delete project');
    }
  };

  const pickerItems = useMemo(
    () => [
      { label: 'Add New Category', value: 'add_new' },
      ...categories.map((c: Category) => ({
        label: c.name,
        value: c.id,
      })),
    ],
    [categories]
  );

  if (loadingProject) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <CustomInput
        name="name"
        control={control}
        label="Name"
        placeholder="Project Name"
        error={errors.name?.message}
      />

      <CustomInput
        name="description"
        control={control}
        label="Description"
        placeholder="Project Description"
        multiline
        error={errors.description?.message}
      />

      <LabeledPicker
        name="categoryId"
        control={control}
        label="Category"
        placeholder="Select Category"
        items={pickerItems}
        error={errors.categoryId?.message}
      />

      <SelectDeadlineInput
        name="deadline"
        control={control}
        error={errors.deadline?.message}
      />

      <CustomButton title="Save Changes" type="primary" onPress={handleSubmit(handleSave)} />
      <CustomButton title="Delete Project" type="delete" onPress={() =>
        Alert.alert('Confirm', 'Delete this project?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: handleDelete },
        ])
      } />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'#fff',
    },
    contentContainer: {
      padding: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.text.secondary,
    },
  });
