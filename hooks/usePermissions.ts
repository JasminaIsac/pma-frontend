import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

export type PermissionStatusValue = 'granted' | 'denied' | 'undetermined';

export async function getCameraStatus(): Promise<PermissionStatusValue> {
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return status as PermissionStatusValue;
}

export async function getMediaLibraryStatus(): Promise<PermissionStatusValue> {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  return status as PermissionStatusValue;
}

export async function getNotificationStatus(): Promise<PermissionStatusValue> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatusValue;
}

type PermissionRequestResult = boolean;

// --- Camera Permission ---
export function useCameraPermission() {
  const { t } = useTranslation();
  const requestCamera = useCallback(async (): Promise<PermissionRequestResult> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log('Camera permission status:', status);

    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        t('settings.permissions.camera.neededTitle'),
        t('settings.permissions.camera.neededMsg'),
        [
          { text: t('common.close'), style: 'cancel' },
          { text: t('common.goToSettings'), onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  }, [t]);

  return { requestCamera };
}

// --- Media Library Permission ---
export function useMediaLibraryPermission() {
  const { t } = useTranslation();
  const requestLibrary = useCallback(async (): Promise<PermissionRequestResult> => {
    let status: ImagePicker.PermissionStatus = ImagePicker.PermissionStatus.GRANTED;

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = res.status;
    }

    console.log('Media library permission status:', status);

    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        t('settings.permissions.mediaLibrary.neededTitle'),
        t('settings.permissions.mediaLibrary.neededMsg'),
        [
          { text: t('common.close'), style: 'cancel' },
          { text: t('common.goToSettings'), onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  }, [t]);

  return { requestLibrary };
}

// --- Notification Permission ---
export function useNotificationPermission() {
  const { t } = useTranslation();
  const requestNotification = useCallback(async (): Promise<PermissionRequestResult> => {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission status:', status);

    if (status !== Notifications.PermissionStatus.GRANTED) {
      Alert.alert(
        t('settings.permissions.notifications.neededTitle'),
        t('settings.permissions.notifications.neededMsg'),
        [
          { text: t('common.close'), style: 'cancel' },
          { text: t('common.goToSettings'), onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  }, [t]);

  return { requestNotification };
}
