import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { PendingAttachment } from 'schemas';

interface AttachmentPreviewProps {
  attachment: PendingAttachment;
  onRemove: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, onRemove }) => {
  const isImage = attachment.mimeType.startsWith('image/');
  const isVideo = attachment.mimeType.startsWith('video/');
  const isUploading = attachment.status === 'uploading';
  const isError = attachment.status === 'error';

  return (
    <View style={[styles.container, isError && styles.containerError]}>
      {isImage ? (
        <Image source={{ uri: attachment.localUri }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons
            name={isVideo ? 'videocam' : 'document-text'}
            size={24}
            color={colors.mediumBlue}
          />
        </View>
      )}

      {isVideo && (
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={22} color={colors.white} />
        </View>
      )}

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="small" color={colors.white} />
        </View>
      )}

      {isError && (
        <View style={styles.uploadingOverlay}>
          <Ionicons name="alert-circle" size={22} color={colors.status.error} />
        </View>
      )}

      <Text style={styles.filename} numberOfLines={1}>
        {attachment.filename}
      </Text>

      {attachment.size > 0 && (
        <Text style={styles.size}>{formatSize(attachment.size)}</Text>
      )}

      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="close-circle" size={18} color={colors.text.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    marginRight: 8,
    alignItems: 'center',
    position: 'relative',
  },
  containerError: {
    opacity: 0.7,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: colors.background.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 25,
    left: 25,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filename: {
    ...textPresets.caption,
    color: colors.text.secondary,
    marginTop: 4,
    width: 72,
    textAlign: 'center',
  },
  size: {
    ...textPresets.caption,
    color: colors.text.disabled,
    fontSize: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: 0,
  },
});
