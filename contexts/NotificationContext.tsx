import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { useNotificationPermission } from '@hooks/usePermissions';

/* ---------------- Notification handler ---------------- */

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/* ---------------- Types ---------------- */

type NotificationData = Record<string, any>;

interface NotificationContextValue {
  sendNotification: (
    title: string,
    body: string,
    data?: NotificationData
  ) => Promise<void>;

  sendDelayedNotification: (
    title: string,
    body: string,
    seconds?: number,
    data?: NotificationData
  ) => Promise<void>;
}

interface NotificationProviderProps {
  children: ReactNode;
}

/* ---------------- Context ---------------- */

const NotificationContext =
  createContext<NotificationContextValue | null>(null);

/* ---------------- Provider ---------------- */

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const notificationListener =
    useRef<Notifications.Subscription | null>(null);

  const responseListener =
    useRef<Notifications.Subscription | null>(null);

  const { requestNotification } = useNotificationPermission();

  useEffect(() => {
    requestNotification();
  }, [requestNotification]);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        // console.log('Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const { notification } = response;
        // console.log('Notification response:', notification);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const sendNotification = async (
    title: string,
    body: string,
    data: NotificationData = {}
  ): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null,
    });
  };

  const sendDelayedNotification = async (
    title: string,
    body: string,
    seconds = 5,
    data: NotificationData = {}
  ): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: {
        type: 'timeInterval',
        seconds,
      } as Notifications.TimeIntervalTriggerInput,
    });
  };

  const value: NotificationContextValue = {
    sendNotification,
    sendDelayedNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/* ---------------- Hook ---------------- */
export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within NotificationProvider'
    );
  }

  return context;
};
