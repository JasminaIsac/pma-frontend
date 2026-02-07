import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { z } from 'zod';
import { useUpdateAvatar, useDeleteAvatar } from '@hooks/queries/useMe';
import { useCameraPermission, useMediaLibraryPermission } from '@hooks/usePermissions';
import useToastNotification from './useToastNotification';

const imageSchema = z
  .string()
  .refine((uri) => {
    const ext = uri.split('.').pop()?.toLowerCase();
    return ext === 'jpg' || ext === 'jpeg' || ext === 'png';
  }, 'Only JPG, JPEG or PNG images are allowed');

export const useAvatarPicker = () => {
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const { requestCamera } = useCameraPermission();
  const { requestLibrary } = useMediaLibraryPermission();
  const { showSuccess } = useToastNotification();

  const { mutateAsync: updateAvatar, isPending: isUpdating } = useUpdateAvatar();
  const { mutateAsync: deleteAvatar, isPending: isDeleting } = useDeleteAvatar();

  const pickImage = async (): Promise<string | null> => {
    const hasPermission = await requestLibrary();
    if (!hasPermission) return null;

    const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return null;

    const uri = result.assets[0].uri;

    try {
      imageSchema.parse(uri);
      return uri;
    } catch (err) {
      if (err instanceof z.ZodError) {
        Alert.alert('Invalid file type', err.issues[0]?.message);
      }
      return null;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    const hasPermission = await requestCamera();
    if (!hasPermission) return null;

    const result: ImagePicker.ImagePickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return null;

    const uri = result.assets[0].uri;

    try {
      imageSchema.parse(uri);
      return uri;
    } catch (err) {
      if (err instanceof z.ZodError) {
        Alert.alert('Invalid file type', err.issues[0]?.message);
      }
      return null;
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      setLocalLoading(true);
      await updateAvatar(uri);
      showSuccess('Success', 'Avatar updated successfully');
      return uri;
    } catch (err) {
      Alert.alert('Upload failed', 'Could not upload image: ' + err);
      return null;
    } finally {
      setLocalLoading(false);
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    try {
      setLocalLoading(true);
      await deleteAvatar();
      Alert.alert('Success', 'Profile picture removed');
      return true;
    } catch (err) {
      Alert.alert('Error', 'Failed to remove image');
      return false;
    } finally {
      setLocalLoading(false);
    }
  };

  return {
    loading: localLoading || isUpdating || isDeleting,
    pickImage,
    takePhoto,
    uploadImage,
    removeAvatar,
  };
};
