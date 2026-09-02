import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@theme/index';
import { useAddUserToProject, useAvailableProjectUsers } from '@hooks/queries/useProjectMembers';
import { ID, UserRole } from 'schemas';
import { CustomButton, LabeledPicker, LoadingIndicator } from '@components/index';
import { useForm } from 'react-hook-form';
import useToastNotification from '@hooks/useToastNotification';
import { useTranslation } from 'react-i18next';

type FormValues = {
  userId: ID | null;
  userRole: UserRole | null;
};

export default function AddProjectMemberScreen(): React.ReactElement {
  const { t } = useTranslation();
  const rawProjectId = useLocalSearchParams().projectId;
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      userId: null,
      userRole: null,
    },
  });

  const router = useRouter();
  if (!projectId) router.back();

  const addMemberMutation = useAddUserToProject();
  const { data: availableUsers = [], isLoading } = useAvailableProjectUsers(projectId);
  const { showSuccess, showError } = useToastNotification();

  const onSubmit = (data: FormValues) => {
    addMemberMutation.mutate(
      {
        projectId,
        userId: data.userId!,
        userRole: data.userRole!,
      },
      {
        onSuccess: () => {
          showSuccess('Success', t('projects.memberAdded'));
          router.back();
        },
        onError: () => {
          showError('Error', t('projects.failedAddMember'));
        },
      },
    );
  };

  if (isLoading)
    return (
      <LoadingIndicator />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('projects.addMemberTitle')}</Text>
      <LabeledPicker
        name="userId"
        control={control}
        rules={{ required: true }}
        label={t('projects.selectUser')}
        placeholder={t('projects.selectUser')}
        items={availableUsers.map((u) => ({
          label: u.name,
          value: u.id,
        }))}
        error={errors.userId ? t('projects.userRequired') : undefined}
      />
      <LabeledPicker
        name="userRole"
        control={control}
        rules={{ required: true }}
        label={t('projects.selectRole')}
        placeholder={t('projects.selectRole')}
        items={[
          { label: t('users.roleDeveloper'), value: UserRole.DEVELOPER },
          { label: t('users.roleProjectManager'), value: UserRole.PROJECT_MANAGER },
        ]}
        error={errors.userRole ? t('projects.roleRequired') : undefined}
      />

      <CustomButton
        title={t('projects.addMemberBtn')}
        onPress={handleSubmit(onSubmit)}
        type="primary"
      />
      <CustomButton
        title={t('common.cancel')}
        onPress={() => router.back()}
        type="secondary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
});
