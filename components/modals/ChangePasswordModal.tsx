import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { colors, textPresets } from '@theme/index';
import { changePassword } from '@api/auth';
import { useToastNotification } from '@hooks/useToastNotification';
import { CustomInput, CustomButton } from '../ui';
import { useTranslation } from 'react-i18next';

const changePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty('Old password is required'),
    newPassword: z
      .string()
      .nonempty('New password is required')
      .min(6, 'New password must be at least 6 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'New password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().nonempty('Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const [apiError, setApiError] = React.useState<string | null>(null);
  const { showSuccess } = useToastNotification();

  const onSubmit = async (data: ChangePasswordFormData) => {
    setApiError(null);
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      showSuccess('Success', t('profile.passwordChanged'));
      reset();
      onClose();
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;
      if (status === 401) {
        setApiError(t('profile.incorrectOldPassword'));
      } else if (status === 400) {
        setApiError(msg || t('profile.passwordMustDiffer'));
      } else {
        setApiError(msg || error?.message || t('common.error'));
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={textPresets.headerLarge}>{t('profile.changePassword')}</Text>

          <CustomInput
            control={control}
            name="oldPassword"
            label={t('profile.oldPassword')}
            placeholder={t('profile.oldPassword')}
            isPassword
            error={errors.oldPassword?.message}
          />
          <CustomInput
            control={control}
            name="newPassword"
            label={t('profile.newPassword')}
            placeholder={t('profile.newPassword')}
            isPassword
            error={errors.newPassword?.message}
          />
          <CustomInput
            control={control}
            name="confirmPassword"
            label={t('profile.confirmNewPassword')}
            placeholder={t('profile.confirmNewPassword')}
            isPassword
            error={errors.confirmPassword?.message}
          />

          {apiError && (
            <Text style={{ color: colors.text.error, marginBottom: 8 }}>{apiError}</Text>
          )}

          <CustomButton
            title={isSubmitting ? t('profile.changingPassword') : t('profile.changePassword')}
            type={isSubmitting ? 'disabled' : 'primary'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            style={{ width: '100%', marginBottom: 10 }}
          />

          <CustomButton
            title={t('common.cancel')}
            onPress={() => { reset(); setApiError(null); onClose(); }}
            type="secondary"
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.overlay,
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.background.primary,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
});
