import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { CustomInput, CustomButton, ChangePasswordModal, LoadingIndicator } from '@components/index';
import { colors } from '@theme/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { router } from 'expo-router';
import { z } from 'zod';
import { useMe } from '@hooks/queries/useMe';
import { useUpdateUser } from '@hooks/queries/useUsers';
import useToastNotification from '@hooks/useToastNotification';
import { useTranslation } from 'react-i18next';

type EditProfileFormData = {
  name: string;
  location: string;
  tel: string;
};

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const { data: user, isLoading } = useMe();
  const { mutateAsync: updateUserMutation } = useUpdateUser();
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  const editProfileSchema = useMemo(() => z.object({
    name: z.string().min(2, t('validation.nameMinChars', { count: 2 })),
    location: z.string().min(2, t('validation.locationTooShort')),
    tel: z.string()
      .min(6, t('validation.phoneTooShort'))
      .regex(/^[0-9+\-\s]+$/, t('validation.invalidPhone')),
  }), [t]);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      location: user?.location ?? "",
      tel: user?.tel ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        location: user.location ?? "",
        tel: user.tel ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (formData: EditProfileFormData) => {
    if (!user?.id) return;
    try {
      await updateUserMutation({ id: user.id, data: formData });
      showSuccess("Success", t('profile.updated'));
      router.back();
    } catch {
      showError("Error", t('profile.failedUpdate'));
    }
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CustomInput
        name="name"
        control={control}
        label={t('users.name')}
        placeholder={t('users.name')}
        error={errors.name?.message}
      />

      <CustomInput
        name="location"
        control={control}
        label={t('users.location')}
        placeholder={t('users.location')}
        error={errors.location?.message}
      />

      <CustomInput
        name="tel"
        control={control}
        label={t('profile.phoneNumber')}
        placeholder={t('profile.phoneNumber')}
        keyboardType="phone-pad"
        error={errors.tel?.message}
      />

      <CustomButton
        title={t('common.saveChanges')}
        onPress={handleSubmit(onSubmit)}
        disabled={!isDirty}
      />
      <CustomButton
        title={t('profile.changePassword')}
        type="delete"
        onPress={() => setPasswordModalVisible(true)}
      />

      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
});

export default EditProfile;
