import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { MemberAvatar } from '@components/users/MemberAvatar';
import { useTranslation } from 'react-i18next';

interface AddParticipantModalProps {
  users: any[];
  isPending: boolean;
  onAdd: (userId: string) => void;
  onClose: () => void;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  users,
  isPending,
  onAdd,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
  <View style={styles.overlay}>
    <View style={styles.modal}>
      <View style={styles.header}>
        <Text style={[textPresets.headerMedium, { color: colors.text.primary }]}>
          {t('conversations.addParticipant')}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ maxHeight: 320 }}>
        {users.length === 0 ? (
          <Text style={styles.emptyText}>{t('conversations.allInGroup')}</Text>
        ) : (
          users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.row}
              onPress={() => onAdd(user.id)}
              disabled={isPending}
            >
              <MemberAvatar member={user} size={38} />
              <Text style={[styles.name, { marginLeft: 10 }]} numberOfLines={1}>
                {user.name}
              </Text>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={colors.mediumBlue}
                style={{ marginLeft: 'auto' }}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  name: {
    ...textPresets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  emptyText: {
    ...textPresets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
