import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ConfirmModal } from '@components/modals/ConfirmModal';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { useAuth } from '@contexts/AuthContext';
import { useMe } from '@hooks/queries/useMe';
import { textPresets, colors } from '@theme/index';
import { CustomButton, UserDetails, UserAvatar, LoadingIndicator } from '@components/index';
import { useTranslation } from 'react-i18next';

const ProfileScreen: React.FC = () => {
  const { logout } = useAuth();
  const { data: user, isLoading } = useMe();
  const { t } = useTranslation();

  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const handleLogout = () => {
    confirm({
      title: t('auth.logoutConfirmTitle'),
      message: t('auth.logoutConfirmMessage'),
      confirmLabel: t('common.logout'),
      cancelLabel: t('common.cancel'),
      onConfirm: async () => {
        try {
          await logout();
        } catch (error) {
          console.error('Error logging out:', error);
        }
      },
    });
  };

  if (isLoading) return <LoadingIndicator />;

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={[textPresets.noData, { color: colors.text.error }]}>
          {t('profile.noUser')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <UserAvatar uri={user.avatarUrl} name={user.name} />
      <UserDetails user={user} customStyles={{ paddingVertical: 15 }} />
      <CustomButton
        title={t('common.logout')}
        type="delete"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
      <ConfirmModal {...confirmModalProps} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background.secondary,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 0,
  },
});

export default ProfileScreen;
