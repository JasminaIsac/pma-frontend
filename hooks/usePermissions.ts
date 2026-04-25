import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

type PermissionRequestResult = boolean;

// --- Camera Permission ---
export function useCameraPermission() {
  const requestCamera = useCallback(async (): Promise<PermissionRequestResult> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log('Camera permission status:', status);

    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        'Camera Permission Needed',
        'You need to allow camera access in settings.',
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  }, []);

  return { requestCamera };
}

// --- Media Library Permission ---
export function useMediaLibraryPermission() {
  const requestLibrary = useCallback(async (): Promise<PermissionRequestResult> => {
    let status: ImagePicker.PermissionStatus = ImagePicker.PermissionStatus.GRANTED;

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = res.status;
    }

    console.log('Media library permission status:', status);

    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert(
        'Gallery Permission Needed',
        'You need to allow gallery access in settings.',
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  }, []);

  return { requestLibrary };
}

// --- Notification Permission ---
export function useNotificationPermission() {
  const requestNotification = useCallback(async (): Promise<PermissionRequestResult> => {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission status:', status);

    if (status !== Notifications.PermissionStatus.GRANTED) {
      Alert.alert(
        'Notification Permission Needed',
        'You need to allow notifications to receive notifications.',
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  }, []);

  return { requestNotification };
}
