import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { colors, textPresets } from "@theme/index";
import { Message } from "schemas";
import { AttachmentList } from "./AttachmentList";
import { MentionText } from "./MentionText";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onAvatarPress?: (userId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, onAvatarPress }) => {
  const hasText = message.message && message.message.trim().length > 0;
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const mentions = message.mentions ?? [];

  return (
    <View style={[styles.container, isOwn ? styles.own : styles.other]}>
      {!isOwn && (
        <TouchableOpacity
          onPress={() => onAvatarPress?.(message.sender.id)}
          activeOpacity={onAvatarPress ? 0.7 : 1}
          disabled={!onAvatarPress}
        >
          {message.sender.avatarUrl ? (
            <Image source={{ uri: message.sender.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {message.sender.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && (
          <Text style={[textPresets.bodySmallBold, { color: colors.text.secondary }]}>
            {message.sender.name}
          </Text>
        )}

        {hasText && (
          <MentionText text={message.message} mentions={mentions} isOwn={isOwn} />
        )}

        {hasAttachments && (
          <AttachmentList attachments={message.attachments} />
        )}

        <Text style={[textPresets.caption, { color: colors.text.secondary, alignSelf: 'flex-end' }]}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: "flex-end",
  },
  own: {
    justifyContent: "flex-end",
  },
  other: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 6,
  },
  avatarPlaceholder: {
    backgroundColor: colors.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.darkBlue,
  },
  bubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 14,
  },
  bubbleOwn: {
    backgroundColor: colors.lightOrange,
    borderColor: colors.mediumOrange,
  },
  bubbleOther: {
    backgroundColor: colors.background.primary,
    borderColor: colors.text.secondary,
  },
});
