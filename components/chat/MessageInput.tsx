import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@theme/index';
import { Message } from 'schemas';
import { createMessage } from "api/messages";
import { CustomButton } from '../ui';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  // const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  // const handleSend = async () => {
  //   if (!text.trim() || sending) return;

  //   const payload = {
  //     conversationId,
  //     message: text,
  //   }

  //   setSending(true);
  //   try {
  //     const newMessage = await createMessage(payload);
  //     onMessageSent(newMessage);
  //     setText("");
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   } finally {
  //     setSending(false);
  //   }
  // };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Message..."
        multiline
      />
      <CustomButton
        title="Send"
        onPress={handleSend}
        // disabled={sending}
        style={styles.sendButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: colors.background.primary,
    marginTop: 15,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.lightOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  sendButton: {
    height: 44,
    marginLeft: 12,
    borderRadius: 22,
    elevation: 0,
    backgroundColor: colors.mediumOrange,
  },
});