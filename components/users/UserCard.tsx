import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { User } from 'schemas';
import { formatEnum } from '@utils/enumsHelpers';
import { MemberAvatar } from './MemberAvatar';
import { Tag } from '../ui';

interface UserCardProps {
  user: User;
  onPress?: (event: GestureResponderEvent) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <MemberAvatar member={user} size={70}/>
      <View style={styles.textContainer}>
        <Tag title={formatEnum(user.role)} backgroundColor={colors.lightBlue} textColor={colors.darkBlue} style={{ marginVertical: 2 }} />
        <Text style={[textPresets.headerMedium, { color: colors.mediumOrange }, { marginBottom: 0 }]}>{user.name}</Text>
        <Text style={[textPresets.bodyMediumBold, { color: colors.darkBlue, marginBottom: 4 }]}>{user.email}</Text>
        <Text style={[textPresets.bodySmallBold, { color: colors.text.secondary }]}>{user.tel}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    padding: 12,
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 12
  },
  textContainer: {
    flex: 1,
  },
});