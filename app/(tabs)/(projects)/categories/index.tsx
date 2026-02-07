import { useState } from 'react';
import { StyleSheet, Alert, ScrollView, Text, View } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory } from '@hooks/queries/useCategories';
import { useToastNotification } from '@hooks/useToastNotification';
import { useMe } from '@hooks/queries/useMe';
import { useProjectCountByCategory } from '@hooks/queries/useProjects';
import { CustomButton, CategoryModal, CategoryCard, LoadingIndicator } from '@components/index';
import { Category } from 'schemas';

const CategoriesScreen = () => {
  const { data: user, isLoading: loadingUser } = useMe();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: projectsCounts } = useProjectCountByCategory();

  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  
  const { showSuccess, showError } = useToastNotification();

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
          data: { name: newName } 
        });
        showSuccess('Success', 'Category updated successfully');
      } else {
        const result = await addCategoryMutation.mutateAsync({ name: newName });
        if (result.isRestored) {
          showSuccess(
            'Category Restored', 
            `"${newName}" was previously deleted and has been restored.`
          );
        } else showSuccess('Success', 'Category added successfully');
      }
      onCloseModal();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setServerError('Category already exists');
      } else {
        showError('Error', selectedCategory ? 'Failed to update category' : 'Failed to add category');
      }
    }
  };

  const handleRemoveCategory = (category: Category) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(category.id) },
      ]
    );
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      showSuccess('Success', 'Category deleted successfully');
    } catch (error: any) {
      let title = 'Error';
      let message = 'Failed to delete category';

      if (error.response?.status === 404) {
        message = 'Category not found';
      } else if (error.response?.status === 400) {
        title = 'Cannot delete category';
        message = 'Category is associated with projects';
      } else {
        console.error('Unexpected error:', error);
      }
      showError(title, message);
    }
  };

  const onCloseModal = () => {
    setIsCategoryModalVisible(false);
    setSelectedCategory(null);
    setServerError(null);
  };

  if (loadingUser || loadingCategories) {
    return <LoadingIndicator />
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={textPresets.headerLarge}>All Categories</Text>

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
        title="Add Category"
        type="primary"
        onPress={() => {
          setSelectedCategory(null);
          setIsCategoryModalVisible(true);
        }}
      />
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
