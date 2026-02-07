import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { Message } from 'schemas';

interface MessageItemProps {
  message: Message;
  isMine: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isMine }) => {
  return (
    <View
      style={[
        styles.messageContainer,
        isMine ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text
        style={[
          styles.sender,
          { color: isMine ? colors.darkBlue : colors.darkOrange },
        ]}
      >
        {isMine ? 'You' : message.sender.name}
      </Text>

      <Text style={styles.messageText}>{message.message}</Text>

      <Text style={styles.createdAt}>
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 12,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    maxWidth: '75%',
    elevation: 3,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.message.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.message.secondary,
  },
  sender: {
    ...textPresets.bodySmallBold,
    marginBottom: 2,
  },
  messageText: {
    ...textPresets.bodyMedium,
    color: colors.text.primary,
  },
  createdAt: {
    ...textPresets.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
});