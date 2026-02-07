import { useNotification } from '@contexts/index';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type ShowFn = (title: string, message: string, delay?: number) => void;

export const useToastNotification = () => {
  const { sendNotification, sendDelayedNotification } = useNotification();

  const show = (
    type: ToastType,
    title: string,
    message: string,
    delay?: number
  ): void => {
    if (delay && delay > 0) {
      sendDelayedNotification(title, message, delay, { type });
    } else {
      sendNotification(title, message, { type });
    }
  };

  return {
    showSuccess: ((t, m, d) => show('success', t, m, d)) as ShowFn,
    showError:   ((t, m, d) => show('error', t, m, d)) as ShowFn,
    showInfo:    ((t, m, d) => show('info', t, m, d)) as ShowFn,
    showWarning: ((t, m, d) => show('warning', t, m, d)) as ShowFn,
  };
};

export default useToastNotification;