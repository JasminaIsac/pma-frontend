import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { UserRole, ID } from 'schemas';
import useToastNotification from '@hooks/useToastNotification';
import { useAvailableProjectUsers, useAddUserToProject } from '@hooks/queries/useProjectMembers';
import { CustomButton, SimplePicker } from '../ui';
import { useTranslation } from 'react-i18next';

interface Props {
  projectId: ID;
}

export const AddMemberForm = ({ projectId }: Props) => {
  const { t } = useTranslation();
  const { data: availableUsers = [] } = useAvailableProjectUsers(projectId as ID);
  const addMemberMutation = useAddUserToProject();
  const { showSuccess, showError } = useToastNotification();
  const [selectedUser, setSelectedUser] = useState<ID | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [error, setError] = useState<string>('');

  const handleAdd = () => {
    if (!selectedUser || !selectedRole || !projectId) {
      setError(t('common.error'));
      return;
    }
    addMemberMutation.mutate(
      { userId: selectedUser, projectId: projectId as ID, userRole: selectedRole },
      {
        onSuccess: () => {
          showSuccess('Success', t('projects.memberAdded'));
          setSelectedUser(null);
          setSelectedRole('');
          setError('');
        },
        onError: () => {
          showError('Error', t('projects.failedAddMember'));
        },
      }
    );
  };

  return (
    <View style={styles.form}>
      <SimplePicker
        label={t('projects.selectUser')}
        placeholder={t('projects.selectUser')}
        value={selectedUser}
        items={availableUsers.map((u) => ({ label: u.name, value: u.id }))}
        onChange={(val) => { setSelectedUser(val as ID); setError(''); }}
        error={error}
      />
      <SimplePicker
        label={t('projects.selectRole')}
        placeholder={t('projects.selectRole')}
        value={selectedRole}
        items={[
          { label: t('users.roleDeveloper'), value: UserRole.DEVELOPER },
          { label: t('users.roleProjectManager'), value: UserRole.PROJECT_MANAGER },
        ]}
        onChange={(val) => { setSelectedRole(val as UserRole); setError(''); }}
        error={error}
      />
      <CustomButton title={t('common.add')} type="primary" onPress={handleAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
