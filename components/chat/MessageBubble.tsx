import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, textPresets } from "@theme/index";
import { Message } from "schemas";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <View style={[styles.container, isOwn ? styles.own : styles.other]}>
      {!isOwn && message.sender.avatarUrl && (
        <Image source={{ uri: message.sender.avatarUrl }} style={styles.avatar} />
      )}

      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {!isOwn && <Text style={[textPresets.bodySmallBold, { color: colors.text.secondary }]}>{message.sender.name}</Text>}
        <Text style={[textPresets.bodyMedium, { color: colors.text.primary }]}>
          {message.message}
        </Text>
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