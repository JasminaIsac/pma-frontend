import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { MessageAttachment } from 'schemas';

interface AttachmentListProps {
  attachments: MessageAttachment[];
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const openUrl = (url: string) => {
  Linking.openURL(url).catch(() => {});
};

const ImageAttachment: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => (
  <TouchableOpacity onPress={() => openUrl(attachment.url)} activeOpacity={0.85}>
    <Image
      source={{ uri: attachment.url }}
      style={styles.image}
      resizeMode="cover"
    />
  </TouchableOpacity>
);

const VideoAttachment: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => (
  <TouchableOpacity style={styles.videoContainer} onPress={() => openUrl(attachment.url)} activeOpacity={0.85}>
    <View style={styles.videoInner}>
      <Ionicons name="play-circle-outline" size={40} color={colors.white} />
    </View>
    <Text style={styles.videoLabel} numberOfLines={1}>{attachment.filename}</Text>
  </TouchableOpacity>
);

const DocumentAttachment: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => (
  <TouchableOpacity style={styles.documentCard} onPress={() => openUrl(attachment.url)} activeOpacity={0.85}>
    <Ionicons name="document-text-outline" size={28} color={colors.mediumBlue} />
    <View style={styles.documentInfo}>
      <Text style={styles.documentName} numberOfLines={1}>{attachment.filename}</Text>
      <Text style={styles.documentSize}>{formatSize(attachment.size)}</Text>
    </View>
    <Ionicons name="download-outline" size={20} color={colors.text.secondary} />
  </TouchableOpacity>
);

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <View style={styles.container}>
      {attachments.map((att) => {
        if (att.type === 'IMAGE') return <ImageAttachment key={att.id} attachment={att} />;
        if (att.type === 'VIDEO') return <VideoAttachment key={att.id} attachment={att} />;
        return <DocumentAttachment key={att.id} attachment={att} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    gap: 6,
  },
  image: {
    width: 200,
    height: 160,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
  },
  videoContainer: {
    width: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.darkBlue,
  },
  videoInner: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(40,50,113,0.85)',
  },
  videoLabel: {
    ...textPresets.caption,
    color: colors.white,
    padding: 6,
    textAlign: 'center',
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    maxWidth: 220,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...textPresets.bodySmall,
    color: colors.text.primary,
  },
  documentSize: {
    ...textPresets.caption,
    color: colors.text.secondary,
  },
});
