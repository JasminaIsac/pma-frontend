import React, { useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActionSheetIOS,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { useCameraPermission, useMediaLibraryPermission } from '@hooks/usePermissions';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

interface GroupAvatarProps {
  size?: number;
  uri?: string | null;
  name: string;
  canEdit: boolean;
  isLoading?: boolean;
  onUpload: (localUri: string) => void;
  onRemove: () => void;
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  size = 110,
  uri,
  name,
  canEdit,
  isLoading = false,
  onUpload,
  onRemove,
}) => {
  const { t } = useTranslation();
  const { requestLibrary } = useMediaLibraryPermission();
  const { requestCamera } = useCameraPermission();

  const initial = name?.charAt(0).toUpperCase() ?? '?';

  const pickAndUpload = useCallback(async (source: 'library' | 'camera') => {
    const hasPermission = source === 'library' ? await requestLibrary() : await requestCamera();
    if (!hasPermission) return;

    const result = source === 'library'
      ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 })
      : await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });

    if (!result.canceled && result.assets[0]) {
      onUpload(result.assets[0].uri);
    }
  }, [requestLibrary, requestCamera, onUpload]);

  const handlePress = useCallback(() => {
    if (!canEdit) return;

    const hasImage = !!uri;

    if (Platform.OS === 'ios') {
      const options = [t('common.cancel'), t('conversations.takePhoto'), t('conversations.chooseGallery')];
      if (hasImage) options.push(t('conversations.removePhoto'));
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0, destructiveButtonIndex: hasImage ? 3 : undefined },
        async (idx) => {
          if (idx === 1) await pickAndUpload('camera');
          if (idx === 2) await pickAndUpload('library');
          if (hasImage && idx === 3) onRemove();
        },
      );
    } else {
      const buttons: any[] = [
        { text: t('conversations.takePhoto'), onPress: () => pickAndUpload('camera') },
        { text: t('conversations.chooseGallery'), onPress: () => pickAndUpload('library') },
      ];
      if (hasImage) buttons.push({ text: t('conversations.removePhoto'), style: 'destructive', onPress: onRemove });
      buttons.push({ text: t('common.cancel'), style: 'cancel' });
      Alert.alert(t('conversations.groupPhoto'), t('conversations.chooseOption'), buttons, { cancelable: true });
    }
  }, [canEdit, uri, pickAndUpload, onRemove]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={canEdit ? 0.8 : 1}
      disabled={!canEdit}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={{ fontSize: size * 0.38, fontWeight: '700', color: colors.darkBlue }}>
            {initial}
          </Text>
        </View>
      )}

      {isLoading && (
        <View style={[styles.overlay, { borderRadius: size / 2 }]}>
          <ActivityIndicator color={colors.white} />
        </View>
      )}

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
    alignSelf: 'center',
  },
  placeholder: {
    backgroundColor: colors.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.mediumOrange,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
