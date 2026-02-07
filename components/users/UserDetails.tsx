import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { textPresets, colors } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';
import { User } from 'schemas';
import { formatEnum } from '@utils/enumsHelpers';
import { Tag } from '../ui';

interface UserDetailsProps {
  user: User;
  customStyles?: ViewStyle | ViewStyle[];
  textColor?: string;
}

export const UserDetails: React.FC<UserDetailsProps> = ({ user, customStyles, textColor }) => {
  const infoColor = textColor ?? colors.darkBlue;
  const locationColor = textColor ?? colors.darkOrange;

  const statusConfig = colors.userStatus[user.status];

  return (
    <View style={[styles.headerContainer, customStyles]}>
      <Tag
        title={statusConfig.label}
        backgroundColor={statusConfig.color}
        textColor={colors.white}
        style={{ marginBottom: 10 }}
      />
      <Text style={[textPresets.headerLarge, { color: colors.mediumOrange }]}>{user.name}</Text>

      <View style={styles.infoContainer}>
        <Ionicons name="person" size={20} color={infoColor} />
        <Text style={[textPresets.bodyMediumBold, { color: infoColor }]}>{formatEnum(user.role) || 'User'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="mail" size={20} color={infoColor} />
        <Text style={[textPresets.bodyMediumBold, { color: infoColor }]}>{user.email}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Ionicons name="call" size={20} color={infoColor} />
        <Text style={[textPresets.bodyMediumBold, { color: infoColor }]}>{user.tel}</Text>
      </View>

      {user.location && (
        <View style={styles.infoContainer}>
          <Ionicons name="location" size={20} color={locationColor} />
          <Text style={[textPresets.bodyMediumBold, { color: locationColor }]}>{user.location}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    padding: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
});