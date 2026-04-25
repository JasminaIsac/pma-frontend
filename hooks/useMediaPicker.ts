import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { PendingAttachment } from 'schemas';
import { useCameraPermission, useMediaLibraryPermission } from '@hooks/usePermissions';

const getFilenameFromUri = (uri: string): string => {
  return uri.split('/').pop() || 'file';
};

const getMimeFromUri = (uri: string, fallback = 'application/octet-stream'): string => {
  const ext = uri.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return ext ? (mimeMap[ext] ?? fallback) : fallback;
};

export const useMediaPicker = () => {
  const { requestLibrary } = useMediaLibraryPermission();
  const { requestCamera } = useCameraPermission();

  const pickMedia = async (): Promise<PendingAttachment | null> => {
    const hasPermission = await requestLibrary();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = asset.fileName ?? getFilenameFromUri(uri);
    const mimeType = asset.mimeType ?? getMimeFromUri(uri, 'image/jpeg');
    const size = asset.fileSize ?? 0;

    return {
      localUri: uri,
      filename,
      mimeType,
      size,
      status: 'pending',
    };
  };

  const takePhoto = async (): Promise<PendingAttachment | null> => {
    const hasPermission = await requestCamera();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    const uri = asset.uri;
    const filename = asset.fileName ?? getFilenameFromUri(uri);
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const size = asset.fileSize ?? 0;

    return {
      localUri: uri,
      filename,
      mimeType,
      size,
      status: 'pending',
    };
  };

  const pickDocument = async (): Promise<PendingAttachment | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      const uri = asset.uri;

      // Pe Android URI-urile de tip content:// trebuie copiate în cache (copyToCacheDirectory: true face asta)
      const filename = asset.name ?? getFilenameFromUri(uri);
      const mimeType = asset.mimeType ?? getMimeFromUri(filename);
      const size = asset.size ?? 0;

      return {
        localUri: uri,
        filename,
        mimeType,
        size,
        status: 'pending',
      };
    } catch {
      Alert.alert('Error', 'Could not pick document');
      return null;
    }
  };

  return { pickMedia, takePhoto, pickDocument };
};
