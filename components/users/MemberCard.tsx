import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { formatEnum } from '@utils/index';
import { ProjectMember, UserRole } from 'schemas';
import { MemberAvatar } from './MemberAvatar';
import { Tag } from '../ui';

interface MemberCardProps {
  member: ProjectMember;
  onRemove: ((member: ProjectMember) => void) | null;
  taskCount: number;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onRemove,
  taskCount,
}) => {

  return (
    <View style={styles.card}>
      <MemberAvatar member={member.user} size={40} />
        
      <View style={styles.textContainer}>
        <Text style={textPresets.bodyLargeBold}>{member.user.name}</Text>
        <Text style={[textPresets.bodySmallBold, { color: colors.text.secondary }]}>{member.user.email}</Text>
        <Text style={[ textPresets.bodyMedium, { color: colors.text.accentBlue }, ]}>
          {formatEnum(member.userRole)}
        </Text>
      </View>

      <View style={styles.taskCountContainer}>
        {member.userRole === UserRole.DEVELOPER &&
        <View style={styles.tagWrapper}>
          <Tag
            title={`${taskCount} task${taskCount !== 1 ? 's' : ''}`}
            backgroundColor={colors.mediumBlue}
            textColor="#fff"
          />
        </View>}
        {onRemove && (
          <TouchableOpacity onPress={() => onRemove && onRemove(member)} style={styles.removeButton}>
            <Ionicons name="close-circle" size={28} color="#ff4d4d" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  userDetailsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    flex: 1,
    gap: 1,
    paddingHorizontal: 8,
  },
  taskCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagWrapper: {
    marginRight: 5,
  },
  removeButton: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});