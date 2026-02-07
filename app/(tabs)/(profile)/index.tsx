import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '@contexts/AuthContext';
import { useMe } from '@hooks/queries/useMe';
import { textPresets, colors } from '@theme/index';
import { CustomButton, UserDetails, UserAvatar, LoadingIndicator } from '@components/index';

const ProfileScreen: React.FC = () => {
  const { logout } = useAuth();
  const { data: user, isLoading } = useMe();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Error logging out:', error);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={[textPresets.noData, { color: colors.text.error }]}>
          No user is logged in.
        </Text>
      </View>
    );
  }

  if(isLoading) return <LoadingIndicator />;

  return (
    <ScrollView style={styles.container}>
      <UserAvatar uri={user.avatarUrl} name={user.name} />
      <UserDetails user={user} customStyles={{ paddingVertical: 15 }} />
      <CustomButton
        title="Logout"
        type="delete"
        onPress={handleLogout}
        style={styles.logoutButton}
      />
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
