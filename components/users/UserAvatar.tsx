import React, { useState, useMemo, useCallback } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Alert, ActionSheetIOS } from "react-native";
import { colors } from "@theme/index";
import { useAvatarPicker } from '@hooks/useAvatarPicker';
import { useMe } from "@hooks/queries/useMe";
import { LoadingIndicator, CustomButton } from "../ui";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface UserAvatarProps {
  size?: number;
  uri?: string | null;
  name?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ size = 140, uri, name = "" }) => {
  const { t } = useTranslation();
  const { data: user, isLoading } = useMe();
  const { pickImage, takePhoto, uploadImage, removeAvatar, loading } = useAvatarPicker();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const currentAvatarUri = user?.avatarUrl || uri || null;

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  const avatarSize = expanded ? SCREEN_WIDTH : size;
  const borderRadius = expanded ? 0 : size / 2;
  const marginV = expanded ? 0 : 15;

  const imageSource = useMemo(() => 
    currentAvatarUri ? { uri: currentAvatarUri } : null, 
  [currentAvatarUri]);

  const handleAvatarPress = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      setShowOverlay(false);
    } else {
      setShowOverlay(true);
    }
  }, [expanded]);

  const handleOverlayPress = useCallback(() => setShowOverlay(false), []);

  const handleUpload = useCallback(async (selectedUri: string) => {
    const uploadedRes = await uploadImage(selectedUri);
    if (uploadedRes) {
      setShowOverlay(false);
      setExpanded(true);
    }
  }, [uploadImage]);

  const handleChangeAvatar = useCallback(async () => {
    if (loading) return;

    const hasAvatar = !!currentAvatarUri;

    if (Platform.OS === 'ios') {
      const options = [t('common.cancel'), t('conversations.takePhoto'), t('conversations.chooseGallery')];
      if (hasAvatar) options.push(t('users.deleteAvatar'));

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: hasAvatar ? 3 : undefined,
          cancelButtonIndex: 0,
        },
        async (buttonIndex: number) => {
          let selectedUri: string | null = null;

          if (buttonIndex === 1) selectedUri = await takePhoto();
          if (buttonIndex === 2) selectedUri = await pickImage();
          if (hasAvatar && buttonIndex === 3) {
            const success = await removeAvatar();
            if (success) {
              setExpanded(false);
              setShowOverlay(false);
            }
          }

          if (selectedUri) await handleUpload(selectedUri);
        }
      );
    } else {
      const buttons = [
        {
          text: t('conversations.takePhoto'),
          onPress: async () => {
            const selectedUri = await takePhoto();
            if (selectedUri) await handleUpload(selectedUri);
          }
        },
        {
          text: t('conversations.chooseGallery'),
          onPress: async () => {
            const selectedUri = await pickImage();
            if (selectedUri) await handleUpload(selectedUri);
          }
        },
      ];

      if (hasAvatar) {
        buttons.push({
          text: t('users.deleteAvatar'),
          onPress: async () => {
            const success = await removeAvatar();
            if (success) {
              setExpanded(false);
              setShowOverlay(false);
            }
          }
        });
      }

      Alert.alert(t('users.changeAvatar'), t('conversations.chooseOption'), buttons, { cancelable: true });
    }
  }, [pickImage, takePhoto, handleUpload, removeAvatar, currentAvatarUri, loading]);
  
  if (isLoading) return <LoadingIndicator />;

  return (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
        <View style={[styles.avatarContainer, { width: avatarSize, height: avatarSize, borderRadius, marginVertical: marginV }]}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={{ width: avatarSize, height: avatarSize, borderRadius, resizeMode: "cover" }}
            />
          ) : (
            <View style={[styles.placeholder, { width: avatarSize, height: avatarSize, borderRadius }]}>
              <Text style={{ fontSize: avatarSize * 0.4, color: colors.text.primary, fontWeight: "600" }}>
                {initial}
              </Text>
            </View>
          )}

          {expanded && showOverlay && (
            <>
              <TouchableOpacity style={styles.overlay} onPress={handleOverlayPress} activeOpacity={1} />
              <View style={styles.changeButtonContainer}>
                <CustomButton
                   title={loading ? t('users.processingAvatar') : t('users.changeAvatar')}
                   type="primary"
                   onPress={handleChangeAvatar}
                   disabled={loading}
                />
                <CustomButton title={t('common.close')} type="outline" onPress={() => setExpanded(false)} />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightOrange,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },
  changeButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: SCREEN_WIDTH * 0.6,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -SCREEN_WIDTH * 0.3 }, { translateY: -50 }],
    zIndex: 2,
  },
});