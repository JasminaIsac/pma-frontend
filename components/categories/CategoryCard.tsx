import React, { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { Category, UserRole } from 'schemas';
import { useTranslation } from 'react-i18next';
import useToastNotification from '@hooks/useToastNotification';

interface CategoryCardProps {
  category: Category;
  projectsCount: number;
  onRemove: (category: Category) => void;
  onEdit: (category: Category) => void;
  currentUserRole: UserRole | string;
}

export const CategoryCard: FC<CategoryCardProps> = ({
  category,
  projectsCount,
  onRemove,
  onEdit,
  currentUserRole,
}) => {
  const { t } = useTranslation();
  const canDelete = projectsCount === 0;
  const { showError } = useToastNotification();

  const handleRemovePress = () => {
    if (canDelete) {
      onRemove(category);
    } else {
      if (Platform.OS === 'android')
        showError(t('projects.cannotDeleteCategory'), t('projects.categoryHasActiveProjects'));
      else
        showError(t('projects.cannotDeleteCategory'), t('projects.categoryHasActiveProjects'));
    }
  };

  const countLabel = projectsCount === 1
    ? t('projects.projectCount_one', { count: projectsCount })
    : t('projects.projectCount_other', { count: projectsCount });

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={textPresets.bodyLargeBold}>
          {category.name}
        </Text>
        <Text style={[textPresets.bodySmallBold, { color: colors.text.accentOrange }]}>
          {countLabel}
        </Text>
      </View>

      {currentUserRole !== 'developer' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => onEdit(category)} style={styles.editButton}>
            <Ionicons name="pencil" size={22} color={colors.mediumBlue} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRemovePress} style={styles.removeButton}>
            <Ionicons
              name="close-circle"
              size={26}
              color={canDelete ? colors.text.error : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
