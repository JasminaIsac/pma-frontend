import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { colors, textPresets } from '@theme/index';
import { CustomInput, CustomButton } from '../ui';

const groupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(50, 'Group name is too long'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface GroupNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const GroupNameModal: React.FC<GroupNameModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({ name: '' });
    }
  }, [visible, reset]);

  const handleSave = (data: GroupFormValues) => {
    onSubmit(data.name);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[textPresets.headerLarge, { marginBottom: 15 }]}>
            Create Group
          </Text>

          <CustomInput
            name="name"
            control={control}
            label="Group Name"
            placeholder="Enter group name..."
            error={errors.name?.message}
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
                title="Create"
                onPress={handleSubmit(handleSave)}
                style={{ width: '48%' }}
                disabled={isSubmitting}
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
    backgroundColor: colors.background.primary || '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});