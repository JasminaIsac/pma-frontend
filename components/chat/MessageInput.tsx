import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActionSheetIOS,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { MentionData } from 'schemas';
import { Project } from 'schemas';
import { useTranslation } from 'react-i18next';
import { CustomButton } from '../ui';
import { AttachmentPreview } from './AttachmentPreview';
import { MentionDropdown } from './MentionDropdown';
import { AttachmentPickerSheet, AttachChoice } from './AttachmentPickerSheet';
import { useMediaPicker } from '@hooks/useMediaPicker';
import { useAttachments } from '@hooks/useAttachments';

export interface MessageInputProps {
  onSendMessage: (text: string, attachmentIds: string[], mentionsData: string | null) => void;
  onTyping?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [pendingMentions, setPendingMentions] = useState<MentionData[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showAttachSheet, setShowAttachSheet] = useState(false);

  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const textRef = useRef('');

  const { pickMedia, takePhoto, pickDocument } = useMediaPicker();
  const { pendingAttachments, addAttachment, removeAttachment, resetAttachments, uploadAll } = useAttachments();

  const handleChangeText = useCallback((newText: string) => {
    setText(newText);
    textRef.current = newText;
    onTyping?.();

    const cursor = selectionRef.current.start;
    const textUpToCursor = newText.slice(0, cursor);
    const atIndex = textUpToCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const afterAt = textUpToCursor.slice(atIndex + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt);
        return;
      }
    }
    setMentionQuery(null);
  }, []);

  const handleSelectMention = useCallback((project: Project) => {
    const cursor = selectionRef.current.start;
    const currentText = textRef.current;
    const textUpToCursor = currentText.slice(0, cursor);
    const atIndex = textUpToCursor.lastIndexOf('@');

    if (atIndex === -1) return;

    const displayText = `@${project.name} `;
    const newText = currentText.slice(0, atIndex) + displayText + currentText.slice(cursor);

    setText(newText);
    textRef.current = newText;
    setMentionQuery(null);

    setPendingMentions((prev) => {
      if (prev.some((m) => m.id === project.id)) return prev;
      return [...prev, { id: project.id, name: project.name, type: 'project' as const }];
    });
  }, []);

  const handleAttachChoice = useCallback(async (choice: AttachChoice) => {
    setShowAttachSheet(false);
    let result;
    if (choice === 'media') result = await pickMedia();
    else if (choice === 'photo') result = await takePhoto();
    else result = await pickDocument();
    if (result) addAttachment(result);
  }, [pickMedia, takePhoto, pickDocument, addAttachment]);

  const handleAddMedia = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Photo / Video from Gallery', 'Take Photo', 'Document'], cancelButtonIndex: 0 },
        async (index) => {
          if (index === 1) handleAttachChoice('media');
          else if (index === 2) handleAttachChoice('photo');
          else if (index === 3) handleAttachChoice('document');
        },
      );
    } else {
      setShowAttachSheet(true);
    }
  }, [handleAttachChoice]);

  const handleSend = useCallback(async () => {
    const hasText = text.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasText && !hasAttachments) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const uploadedIds = await uploadAll();
      if (uploadedIds === null) return;

      let messageText = text;
      if (pendingMentions.length > 0) {
        pendingMentions.forEach((mention) => {
          const escapedName = mention.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          messageText = messageText.replace(new RegExp(`@${escapedName}`, 'g'), `[project:${mention.id}]`);
        });
      }

      const mentionsData = pendingMentions.length > 0 ? JSON.stringify(pendingMentions) : null;
      onSendMessage(messageText, uploadedIds, mentionsData);

      setText('');
      textRef.current = '';
      resetAttachments();
      setPendingMentions([]);
      setMentionQuery(null);
    } finally {
      setIsSending(false);
    }
  }, [text, pendingAttachments, pendingMentions, isSending, onSendMessage, uploadAll, resetAttachments]);

  const canSend = (text.trim().length > 0 || pendingAttachments.length > 0) && !isSending;

  return (
    <View>
      {mentionQuery !== null && (
        <MentionDropdown query={mentionQuery} onSelect={handleSelectMention} />
      )}

      {pendingAttachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentStrip}
          contentContainerStyle={styles.attachmentStripContent}
          keyboardShouldPersistTaps="always"
        >
          {pendingAttachments.map((att, index) => (
            <AttachmentPreview
              key={att.localUri}
              attachment={att}
              onRemove={() => removeAttachment(index)}
            />
          ))}
        </ScrollView>
      )}

      <AttachmentPickerSheet
        visible={showAttachSheet}
        onClose={() => setShowAttachSheet(false)}
        onChoose={handleAttachChoice}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handleAddMedia} style={styles.attachButton}>
          <Ionicons name="attach" size={24} color={colors.mediumOrange} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          onSelectionChange={(e) => { selectionRef.current = e.nativeEvent.selection; }}
          placeholder={t('conversations.messagePlaceholder')}
          placeholderTextColor={colors.text.disabled}
          multiline
        />

        {isSending ? (
          <ActivityIndicator size="small" color={colors.mediumOrange} style={styles.sendButton} />
        ) : (
          <CustomButton
            title={t('common.send')}
            onPress={handleSend}
            disabled={!canSend}
            style={styles.sendButton}
            textStyle={{ color: '#FFFFFF' }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  attachmentStrip: {
    maxHeight: 110,
    backgroundColor: colors.background.secondary,
  },
  attachmentStripContent: {
    padding: 8,
    paddingBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: colors.background.primary,
    marginTop: 4,
  },
  attachButton: {
    marginRight: 8,
    padding: 4,
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
    color: colors.white,
    backgroundColor: colors.mediumOrange,
  },
});
