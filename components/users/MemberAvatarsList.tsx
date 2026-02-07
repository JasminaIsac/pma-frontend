import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { ProjectMember } from 'schemas';
import { MemberAvatar } from './MemberAvatar';

interface MemberAvatarsListProps {
  members: ProjectMember[];
  size?: number;
  maxVisible?: number;
}

export const MemberAvatarsList: React.FC<MemberAvatarsListProps> = ({
  members,
  size = 35,
  maxVisible = 4,
}) => {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  return (
    <View style={styles.container}>
      {visibleMembers.map((member, index) => (
        <MemberAvatar
          key={member.id}
          member={member.user}
          size={size}
          marginLeft={index === 0 ? 0 : -size / 3}
        />
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            styles.remainingCircle,
            { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 3 },
          ]}
        >
          <Text style={[textPresets.bodySmallBold, { color: colors.darkOrange }]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingCircle: {
    backgroundColor: colors.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
