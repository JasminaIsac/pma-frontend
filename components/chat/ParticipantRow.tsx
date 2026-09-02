import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { MemberAvatar } from '@components/users/MemberAvatar';
import { ConversationParticipant } from 'schemas';
import { useTranslation } from 'react-i18next';

interface ParticipantRowProps {
  participant: ConversationParticipant;
  isSelf: boolean;
  isParticipantAdmin: boolean;
  isGroup: boolean;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: () => void;
}

export const ParticipantRow: React.FC<ParticipantRowProps> = ({
  participant,
  isSelf,
  isParticipantAdmin,
  isGroup,
  canRemove,
  isRemoving,
  onRemove,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <MemberAvatar member={participant.user} size={42} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {participant.user.name}{isSelf ? ` (${t('common.you').toLowerCase()})` : ''}
        </Text>
        {isParticipantAdmin && isGroup && (
          <Text style={styles.badgeText}>{t('conversations.groupAdmin')}</Text>
        )}
      </View>

      {canRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} disabled={isRemoving}>
          <Ionicons name="close-circle" size={22} color={colors.text.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  info: { flex: 1 },
  name: {
    ...textPresets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  badgeText: {
    ...textPresets.caption,
    color: colors.mediumOrange,
    fontWeight: '700',
  },
  removeBtn: { padding: 4 },
});
