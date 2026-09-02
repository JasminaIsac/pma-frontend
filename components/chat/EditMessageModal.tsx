import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { Message } from 'schemas';
import { useTranslation } from 'react-i18next';

interface EditMessageModalProps {
  message: Message | null;
  text: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
  message,
  text,
  onChangeText,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <Modal visible={!!message} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={[textPresets.headerSmall, styles.title]}>{t('conversations.editMessage')}</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={onChangeText}
            multiline
            autoFocus
            maxLength={5000}
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={onSave}>
              <Text style={styles.saveText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 14,
    padding: 20,
    width: '100%',
  },
  title: {
    marginBottom: 12,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 80,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 10,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
  },
  cancelBtn: { backgroundColor: colors.background.secondary },
  saveBtn: { backgroundColor: colors.mediumOrange },
  cancelText: { color: colors.text.primary, fontWeight: '600' },
  saveText: { color: colors.white, fontWeight: '600' },
});
