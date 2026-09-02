import { useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { ConfirmModal } from '@components/modals/ConfirmModal';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import { useProject, useUpdateProject, useDeleteProject } from '@hooks/queries/useProjects';
import { useCategories } from '@hooks/queries/useCategories';
import { CustomInput, LabeledPicker, SelectDeadlineInput, CustomButton } from '@components/index';
import { colors } from '@theme/colors';
import { Category, UpdateProjectDTO } from 'schemas';
import useToastNotification from '@hooks/useToastNotification';
import { useTranslation } from 'react-i18next';

type ProjectFormData = {
  name: string;
  description?: string;
  categoryId: string;
  deadline?: string;
};

export default function EditProjectScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const navigation = useNavigation();

  const { data: categories = [] } = useCategories();
  const { data: project, isLoading: loadingProject } = useProject(id ?? '');
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const { showSuccess, showError } = useToastNotification();
  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const projectSchema = useMemo(() => z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    description: z.string().optional(),
    categoryId: z.string().min(1, t('validation.categoryRequired')),
    deadline: z.string().optional(),
  }), [t]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', categoryId: '', deadline: '' },
  });

  useEffect(() => {
    if (project) {
      setValue('name', project.name);
      setValue('description', project.description ?? '');
      setValue('categoryId', project.categoryId);
      setValue('deadline', project.deadline ?? '');
    }
  }, [project, setValue]);

  const pickerItems = useMemo(
    () => [
      { label: t('projects.addNewCategory'), value: 'add_new' },
      ...categories.map((c: Category) => ({ label: c.name, value: c.id })),
    ],
    [categories, t]
  );

  const handleSave = async (data: ProjectFormData) => {
    if (!project) return;
    const payload: UpdateProjectDTO = { ...data };
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, data: payload });
      showSuccess('Success', t('projects.updated'));
      router.back();
    } catch {
      showError('Error', t('projects.failedUpdate'));
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      showSuccess('Success', t('projects.deleted'));
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'index' }] })
      );
    } catch {
      showError('Error', t('projects.failedDelete'));
    }
  };

  if (loadingProject) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <CustomInput
        name="name"
        control={control}
        label={t('projects.name')}
        placeholder={t('projects.name')}
        error={errors.name?.message}
      />

      <CustomInput
        name="description"
        control={control}
        label={t('projects.description')}
        placeholder={t('projects.description')}
        multiline
        error={errors.description?.message}
      />

      <LabeledPicker
        name="categoryId"
        control={control}
        label={t('projects.category')}
        placeholder={t('projects.selectCategory')}
        items={pickerItems}
        error={errors.categoryId?.message}
      />

      <SelectDeadlineInput
        name="deadline"
        control={control}
        error={errors.deadline?.message}
      />

      <CustomButton title={t('common.saveChanges')} type="primary" onPress={handleSubmit(handleSave)} />
      <CustomButton
        title={t('projects.deleteProject')}
        type="delete"
        onPress={() => confirm({
          title: t('projects.deleteProject'),
          message: t('projects.deleteConfirm'),
          confirmLabel: t('common.delete'),
          onConfirm: handleDelete,
        })}
      />
      <ConfirmModal {...confirmModalProps} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
