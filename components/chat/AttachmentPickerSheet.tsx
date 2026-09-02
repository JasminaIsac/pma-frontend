import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { useTranslation } from 'react-i18next';

export type AttachChoice = 'media' | 'photo' | 'document';

interface AttachmentPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onChoose: (choice: AttachChoice) => void;
}

export const AttachmentPickerSheet: React.FC<AttachmentPickerSheetProps> = ({
  visible,
  onClose,
  onChoose,
}) => {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.row} onPress={() => onChoose('media')}>
            <Ionicons name="images-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowText}>{t('conversations.photoOrVideo')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => onChoose('photo')}>
            <Ionicons name="camera-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowText}>{t('conversations.takePhoto')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => onChoose('document')}>
            <Ionicons name="document-outline" size={22} color={colors.text.primary} />
            <Text style={styles.rowText}>{t('conversations.document')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.cancelRow]} onPress={onClose}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
  rowText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  cancelRow: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.error,
    textAlign: 'center',
    width: '100%',
  },
});
