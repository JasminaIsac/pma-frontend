import { useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { ConfirmModal } from '@components/modals/ConfirmModal';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { colors, textPresets } from '@theme/index';
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory } from '@hooks/queries/useCategories';
import { useToastNotification } from '@hooks/useToastNotification';
import { useMe } from '@hooks/queries/useMe';
import { useProjectCountByCategory } from '@hooks/queries/useProjects';
import { CustomButton, CategoryModal, CategoryCard, LoadingIndicator } from '@components/index';
import { Category } from 'schemas';
import { useTranslation } from 'react-i18next';

const CategoriesScreen = () => {
  const { t } = useTranslation();
  const { data: user, isLoading: loadingUser } = useMe();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: projectsCounts } = useProjectCountByCategory();

  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const { showSuccess, showError } = useToastNotification();
  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSaveCategory = async (category: { name: string }) => {
    setServerError(null);
    const newName = category.name.trim();
    try {
      if (selectedCategory) {
        await updateCategoryMutation.mutateAsync({
          id: selectedCategory.id,
          data: { name: newName },
        });
        showSuccess('Success', t('projects.categoryUpdated'));
      } else {
        const result = await addCategoryMutation.mutateAsync({ name: newName });
        if (result.isRestored) {
          showSuccess(
            t('projects.categoryRestored'),
            t('projects.categoryRestoreMsg', { name: newName }),
          );
        } else {
          showSuccess('Success', t('projects.categoryAdded'));
        }
      }
      onCloseModal();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setServerError(t('projects.categoryExists'));
      } else {
        showError('Error', selectedCategory
          ? t('projects.failedUpdateCategory')
          : t('projects.failedAddCategory'));
      }
    }
  };

  const handleRemoveCategory = (category: Category) => {
    confirm({
      title: t('common.delete'),
      message: t('projects.deleteCategoryConfirm'),
      confirmLabel: t('common.delete'),
      onConfirm: () => confirmDelete(category.id),
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      showSuccess('Success', t('projects.categoryDeleted'));
    } catch (error: any) {
      if (error.response?.status === 404) {
        showError('Error', t('projects.categoryNotFound'));
      } else if (error.response?.status === 400) {
        showError(t('projects.cannotDeleteCategory'), t('projects.categoryHasProjectsError'));
      } else {
        showError('Error', t('projects.failedDeleteCategory'));
      }
    }
  };

  const onCloseModal = () => {
    setIsCategoryModalVisible(false);
    setSelectedCategory(null);
    setServerError(null);
  };

  if (loadingUser || loadingCategories) {
    return <LoadingIndicator />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={textPresets.headerLarge}>{t('projects.allCategories')}</Text>

      <View style={styles.categoryList}>
        {categories.map((category: Category) => {
          const projectCountObj = projectsCounts?.find(pc => pc.categoryId === category.id);
          const count = projectCountObj?.projectsCount ?? 0;

          return (
            <CategoryCard
              key={category.id}
              projectsCount={count}
              category={category}
              onRemove={() => handleRemoveCategory(category)}
              onEdit={() => {
                setSelectedCategory(category);
                setIsCategoryModalVisible(true);
              }}
              currentUserRole={user?.role || 'User'}
            />
          );
        })}
      </View>

      <CategoryModal
        isVisible={isCategoryModalVisible}
        category={selectedCategory}
        onClose={onCloseModal}
        onSubmit={handleSaveCategory}
        error={serverError}
      />

      <CustomButton
        title={t('projects.addCategory')}
        type="primary"
        onPress={() => {
          setSelectedCategory(null);
          setIsCategoryModalVisible(true);
        }}
      />
      <ConfirmModal {...confirmModalProps} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background.primary,
    flexGrow: 1,
  },
  categoryList: {
    marginTop: 10,
    marginBottom: 20,
  },
});

export default CategoriesScreen;
