import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, textPresets } from '@theme/index';
import { Category } from 'schemas';
import { CustomInput, CustomButton } from '../ui';

const categorySchema = z.object({
  name: z
    .string()
    .min(3, 'Category name must be at least 3 characters'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  category?: Category | null;
  error?: string | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  category,
  error,
}) => {
  const isEditing = !!category;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
    },
  });

  useEffect(() => {
    if (!isVisible) return;
    reset({ name: category?.name ?? '' });
  }, [isVisible, category]);

  const handleSave = async (data: CategoryFormValues) => {
    await onSubmit(data);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={textPresets.headerLarge}>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </Text>

          <CustomInput
            name="name"
            control={control}
            label="Category name"
            placeholder="Category name"
            error={errors.name?.message || error}
          />

          <View style={styles.buttons}>
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color={colors.darkBlue}
                style={{ width: '48%' }}
              />
            ) : (
              <CustomButton
                title={isEditing ? 'Update' : 'Save'}
                onPress={handleSubmit(handleSave)}
                style={{ width: '48%' }}
                disabled={isSubmitting || !!error}
              />
            )}

            <CustomButton
              title="Cancel"
              type="secondary"
              onPress={onClose}
              style={{ width: '48%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});