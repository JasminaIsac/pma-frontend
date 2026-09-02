import { useState, useCallback } from 'react';
import type { ConfirmModalProps } from '@components/modals/ConfirmModal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  alertOnly?: boolean;
  onConfirm: () => void;
}

export const useConfirmModal = () => {
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [visible, setVisible] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  const modalProps: ConfirmModalProps = {
    visible,
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel,
    cancelLabel: options.cancelLabel,
    hideCancelButton: options.alertOnly,
    onConfirm: () => {
      dismiss();
      options.onConfirm();
    },
    onCancel: dismiss,
  };

  return { confirm, dismiss, modalProps };
};
