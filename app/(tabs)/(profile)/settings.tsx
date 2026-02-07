import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, textPresets } from '@theme/index';
import { CustomButton } from '@components/index';

type PermissionStatus = ImagePicker.PermissionStatus;

export default function SettingsScreen() {
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>(ImagePicker.PermissionStatus.UNDETERMINED);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState<PermissionStatus>(ImagePicker.PermissionStatus.UNDETERMINED);
  
  // --- verificăm permisiunile la mount ---
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        setCameraPermission(cameraStatus.status as PermissionStatus);

        const libraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        setMediaLibraryPermission(libraryStatus.status as PermissionStatus);
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };

    checkPermissions();
  }, []);

  const handleOpenSettings = () => {
    Alert.alert(
      'Permissions required',
      'You need to grant permissions in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={textPresets.headerMedium}>Permissions</Text>

        <View style={styles.permissionItem}>
          <Text style={textPresets.headerSmall}>Camera Access:</Text>
          <Text style={textPresets.bodyMedium}>
            We need access to your camera to take photos.
          </Text>
          <Text
            style={[
              textPresets.bodyMediumBold,
              {
                color: cameraPermission === 'granted' ? 'green' : 'red',
                fontStyle: 'italic',
              },
            ]}
          >
            {cameraPermission}
          </Text>
          {cameraPermission !== 'granted' && (
            <CustomButton
              title="Go to Settings"
              onPress={handleOpenSettings}
              style={{ marginTop: 10 }}
            />
          )}
        </View>

        <View style={styles.permissionItem}>
          <Text style={textPresets.headerSmall}>Media Library Access:</Text>
          <Text style={textPresets.bodyMedium}>
            We need access to your media library to select photos.
          </Text>
          <Text
            style={[
              textPresets.bodyMediumBold,
              {
                color: mediaLibraryPermission === 'granted' ? 'green' : 'red',
                fontStyle: 'italic',
              },
            ]}
          >
            {mediaLibraryPermission}
          </Text>
          {mediaLibraryPermission !== 'granted' && (
            <CustomButton
              title="Go to Settings"
              onPress={handleOpenSettings}
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background.primary,
    flexGrow: 1,
  },
  section: {
    marginBottom: 30,
  },
  permissionItem: {
    marginBottom: 30,
  },
});