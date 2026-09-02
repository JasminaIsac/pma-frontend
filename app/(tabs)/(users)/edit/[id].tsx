import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CustomInput, CustomButton, LabeledPicker, LoadingIndicator } from '@components/index';
import { ConfirmModal } from '@components/modals/ConfirmModal';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { colors } from '@theme/index';
import { useUser, useUpdateUser, useDeleteUser } from '@hooks/queries/useUsers';
import { UserRole, UserStatus, ID } from 'schemas/index';
import { useToastNotification } from '@hooks/useToastNotification';
import { useTranslation } from 'react-i18next';

type EditUserFormValues = {
  name: string;
  tel?: string;
  location?: string;
  role: UserRole;
  status: UserStatus;
};

const EditUserScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { showSuccess, showError } = useToastNotification();

  const { data: user, isLoading: loadingUser } = useUser(userId as ID);
  const { mutate: updateUserMutate, isPending: updating } = useUpdateUser();
  const { mutate: deleteUserMutate, isPending: deleting } = useDeleteUser();
  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const userSchema = useMemo(() => z.object({
    name: z.string().min(3, t('validation.nameMinChars', { count: 3 })),
    tel: z.string()
      .refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val), t('validation.invalidPhoneFormat'))
      .optional(),
    location: z.string().optional(),
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus),
  }), [t]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditUserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      tel: '',
      location: '',
      role: UserRole.DEVELOPER,
      status: UserStatus.ACTIVE,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        tel: user.tel ?? '',
        location: user.location ?? '',
        role: user.role,
        status: user.status,
      });
    }
  }, [user, reset]);

  const onDelete = () => {
    if (!user) return;
    confirm({
      title: t('common.delete'),
      message: t('users.deleteConfirm'),
      confirmLabel: t('common.delete'),
      onConfirm: () =>
        deleteUserMutate(user.id, {
          onSuccess: () => {
            showSuccess('Success', t('users.deleted'));
            router.back();
            router.back();
          },
          onError: () => showError('Error', t('users.failedDelete')),
        }),
    });
  };

  const onSave = (data: EditUserFormValues) => {
    if (!user) return;
    updateUserMutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          showSuccess('Success', t('users.updated'));
          setTimeout(() => router.back(), 200);
        },
        onError: () => showError('Error', t('users.failedUpdate')),
      }
    );
  };

  if (loadingUser || !user) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CustomInput control={control} name="name" label={t('users.name')} placeholder={t('users.name')} error={errors.name?.message} />
          <CustomInput control={control} name="tel" label={t('users.tel')} placeholder={t('users.tel')} error={errors.tel?.message} />
          <LabeledPicker
            control={control}
            name="role"
            label={t('users.role')}
            placeholder={t('users.role')}
            items={[
              { label: t('users.roleAdmin'), value: UserRole.ADMIN },
              { label: t('users.roleProjectManager'), value: UserRole.PROJECT_MANAGER },
              { label: t('users.roleDeveloper'), value: UserRole.DEVELOPER },
            ]}
            error={errors.role?.message}
          />
          <CustomInput control={control} name="location" label={t('users.location')} placeholder={t('users.location')} error={errors.location?.message} />
          <LabeledPicker
            control={control}
            name="status"
            label={t('users.status')}
            placeholder={t('users.status')}
            items={[
              { label: t('users.statusActive'), value: UserStatus.ACTIVE },
              { label: t('users.statusInactive'), value: UserStatus.INACTIVE },
              { label: t('users.statusBanned'), value: UserStatus.BANNED },
            ]}
            error={errors.status?.message}
          />
          <View style={styles.actionRow}>
            <CustomButton title={t('common.delete')} type="delete" onPress={onDelete} disabled={deleting} style={{ flex: 1 }} />
            <CustomButton title={t('common.saveChanges')} onPress={handleSubmit(onSave)} disabled={updating} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      <ConfirmModal {...confirmModalProps} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default EditUserScreen;
