import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { textPresets, colors } from '@theme/index';
import { Message, ID } from 'schemas';
import { MessageItem } from './MessageItem';

interface DateSeparatorProps {
  date: string;
}

interface MessagesListProps {
  messages: Message[];
  currentUserId: ID;
}

export const DateSeparator = ({ date }: DateSeparatorProps) => (
  <Text style={styles.dateSeparator}>{date}</Text>
);

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
}) => {
  if (messages.length === 0) {
    return (
      <View style={styles.emptyMessages}>
        <Text style={[textPresets.noData, { color: colors.white }]}>
          No messages yet
        </Text>
      </View>
    );
  }

  let lastDate: string | null = null;

  return (
    <>
      {messages.map(message => {
        const messageDate = new Date(message.createdAt).toDateString();
        const showDateSeparator = lastDate !== messageDate;
        lastDate = messageDate;

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <DateSeparator
                date={new Date(message.createdAt).toLocaleDateString()}
              />
            )}

            <MessageItem
              message={message}
              isMine={message.senderId === currentUserId}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  dateSeparator: {
    ...textPresets.bodySmall,
    color: colors.white,
    textAlign: 'center',
    marginVertical: 14,
  },
  emptyMessages: {
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});