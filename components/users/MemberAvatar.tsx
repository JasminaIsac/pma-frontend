import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { User } from 'schemas';

interface MemberAvatarProps {
  member: Pick<User, 'name' | 'avatarUrl'>;
  size?: number;
  marginLeft?: number;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 35, marginLeft = 0 }) => {
  return (
    <View
      style={[
        styles.avatarWrapper,
        { width: size + 2, height: size + 2, borderRadius: size, marginLeft },
      ]}
    >
      {member.avatarUrl ? (
        <Image
          source={{ uri: member.avatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Text style={[textPresets.bodySmallBold, { color: colors.white, textAlign: 'center', fontSize: size/3 }]}>
            {member.name[0].toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  placeholder: {
    backgroundColor: colors.mediumOrange,
    alignItems: 'center',
    justifyContent: 'center',
  }
});