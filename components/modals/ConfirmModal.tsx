import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { colors, textPresets } from '@theme/index';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancelButton?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  hideCancelButton = false,
  onConfirm,
  onCancel,
}) => {
  React.useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true; // consume the event so the navigator does NOT go back
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  return (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttons}>
          {!hideCancelButton && (
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={onConfirm}>
            <Text style={styles.confirmText}>{confirmLabel}</Text>
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
    padding: 24,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  title: {
    ...textPresets.headerMedium,
    color: colors.text.primary,
    marginBottom: 8,
  },
  message: {
    ...textPresets.bodyMedium,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.background.secondary,
  },
  confirmBtn: {
    backgroundColor: colors.button.delete,
  },
  cancelText: {
    ...textPresets.bodyMediumBold,
    color: colors.text.primary,
  },
  confirmText: {
    ...textPresets.bodyMediumBold,
    color: colors.white,
  },
});
