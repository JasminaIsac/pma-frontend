import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { Message } from 'schemas';
import { useTranslation } from 'react-i18next';

const COLOR_DESTRUCTIVE = '#dc2626';

interface MessageActionSheetProps {
  message: Message | null;
  currentUserId: string;
  canModify: (msg: Message) => boolean;
  onClose: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActionSheet: React.FC<MessageActionSheetProps> = ({
  message,
  currentUserId,
  canModify,
  onClose,
  onCopy,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const isOwn = message?.senderId === currentUserId;
  const modifiable = message ? canModify(message) : false;

  return (
    <Modal visible={!!message} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.row} onPress={onCopy} activeOpacity={0.7}>
            <Ionicons name="copy-outline" size={20} color={colors.text.primary} />
            <Text style={styles.rowText}>{t('conversations.copyMessage')}</Text>
          </TouchableOpacity>

          {isOwn && modifiable && (
            <TouchableOpacity style={styles.row} onPress={onEdit} activeOpacity={0.7}>
              <Ionicons name="pencil-outline" size={20} color={colors.text.primary} />
              <Text style={styles.rowText}>{t('conversations.editMessage')}</Text>
            </TouchableOpacity>
          )}

          {isOwn && modifiable && (
            <TouchableOpacity style={styles.row} onPress={onDelete} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={20} color={COLOR_DESTRUCTIVE} />
              <Text style={[styles.rowText, { color: COLOR_DESTRUCTIVE }]}>{t('conversations.deleteMessage')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 14,
  },
  rowText: {
    ...textPresets.bodyMedium,
    color: colors.text.primary,
  },
});
