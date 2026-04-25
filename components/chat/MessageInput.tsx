import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActionSheetIOS,
  Alert,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { PendingAttachment, MentionData } from 'schemas';
import { Project } from 'schemas';
import { CustomButton } from '../ui';
import { AttachmentPreview } from './AttachmentPreview';
import { MentionDropdown } from './MentionDropdown';
import { useMediaPicker } from '@hooks/useMediaPicker';
import { uploadAttachment } from 'api/attachments';

export interface MessageInputProps {
  onSendMessage: (text: string, attachmentIds: string[], mentionsData: string | null) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [pendingMentions, setPendingMentions] = useState<MentionData[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const textRef = useRef('');

  const { pickMedia, takePhoto, pickDocument } = useMediaPicker();

  // Detectăm @mention la fiecare schimbare de text
  const handleChangeText = useCallback((newText: string) => {
    setText(newText);
    textRef.current = newText;

    // Căutăm '@' înainte de cursor fără spațiu după el
    const cursor = selectionRef.current.start;
    const textUpToCursor = newText.slice(0, cursor);
    const atIndex = textUpToCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const afterAt = textUpToCursor.slice(atIndex + 1);
      // Activăm dropdown-ul dacă nu are spații după @
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

    // În input afișăm @NumeProiect (user-friendly), nu marker-ul tehnic
    const displayText = `@${project.name} `;
    const newText = currentText.slice(0, atIndex) + displayText + currentText.slice(cursor);

    setText(newText);
    textRef.current = newText;
    setMentionQuery(null);

    setPendingMentions((prev) => {
      // Evităm duplicate
      if (prev.some((m) => m.id === project.id)) return prev;
      return [...prev, { id: project.id, name: project.name, type: 'project' as const }];
    });
  }, []);

  const handleAddMedia = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Photo / Video from Gallery', 'Take Photo', 'Document'],
          cancelButtonIndex: 0,
        },
        async (index) => {
          if (index === 1) {
            const result = await pickMedia();
            if (result) addPendingAttachment(result);
          } else if (index === 2) {
            const result = await takePhoto();
            if (result) addPendingAttachment(result);
          } else if (index === 3) {
            const result = await pickDocument();
            if (result) addPendingAttachment(result);
          }
        },
      );
    } else {
      Alert.alert('Add Attachment', 'Choose source', [
        {
          text: 'Photo / Video from Gallery',
          onPress: async () => {
            const result = await pickMedia();
            if (result) addPendingAttachment(result);
          },
        },
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await takePhoto();
            if (result) addPendingAttachment(result);
          },
        },
        {
          text: 'Document',
          onPress: async () => {
            const result = await pickDocument();
            if (result) addPendingAttachment(result);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [pickMedia, takePhoto, pickDocument]);

  const addPendingAttachment = (attachment: PendingAttachment) => {
    setPendingAttachments((prev) => [...prev, attachment]);
  };

  const removeAttachment = useCallback((index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(async () => {
    const hasText = text.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasText && !hasAttachments) return;
    if (isSending) return;

    setIsSending(true);

    try {
      // Uploadăm toate attachment-urile
      const uploadedIds: string[] = [];
      const updatedAttachments = [...pendingAttachments];

      for (let i = 0; i < updatedAttachments.length; i++) {
        const att = updatedAttachments[i];
        if (att.status === 'done' && att.uploadedId) {
          uploadedIds.push(att.uploadedId);
          continue;
        }

        // Marcăm ca uploading
        updatedAttachments[i] = { ...att, status: 'uploading' };
        setPendingAttachments([...updatedAttachments]);

        try {
          const res = await uploadAttachment(att.localUri, att.filename, att.mimeType);
          updatedAttachments[i] = {
            ...att,
            status: 'done',
            uploadedId: res.attachmentId,
            uploadedUrl: res.url,
          };
          uploadedIds.push(res.attachmentId);
        } catch {
          updatedAttachments[i] = { ...att, status: 'error' };
          setPendingAttachments([...updatedAttachments]);
          Alert.alert('Upload failed', `Could not upload "${att.filename}". Tap Send to retry.`);
          setIsSending(false);
          return;
        }
      }

      setPendingAttachments([...updatedAttachments]);

      // Convertim @NumeProiect → [project:uuid] în textul trimis
      // Userul vede @NumeProiect în input, dar serverul stochează marker-ul tehnic
      let messageText = text;
      if (pendingMentions.length > 0) {
        pendingMentions.forEach((mention) => {
          // Escaped name pentru regex
          const escapedName = mention.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const mentionRegex = new RegExp(`@${escapedName}`, 'g');
          messageText = messageText.replace(mentionRegex, `[project:${mention.id}]`);
        });
      }

      // Construim mentionsData
      const mentionsData =
        pendingMentions.length > 0 ? JSON.stringify(pendingMentions) : null;

      onSendMessage(messageText, uploadedIds, mentionsData);

      // Reset state
      setText('');
      textRef.current = '';
      setPendingAttachments([]);
      setPendingMentions([]);
      setMentionQuery(null);
    } finally {
      setIsSending(false);
    }
  }, [text, pendingAttachments, pendingMentions, isSending, onSendMessage]);

  const canSend = (text.trim().length > 0 || pendingAttachments.length > 0) && !isSending;

  return (
    <View>
      {/* Mention Dropdown */}
      {mentionQuery !== null && (
        <MentionDropdown query={mentionQuery} onSelect={handleSelectMention} />
      )}

      {/* Attachment previews */}
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
              key={`${att.localUri}-${index}`}
              attachment={att}
              onRemove={() => removeAttachment(index)}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        {/* Attachment button */}
        <TouchableOpacity onPress={handleAddMedia} style={styles.attachButton}>
          <Ionicons name="attach" size={24} color={colors.mediumOrange} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          onSelectionChange={(e) => {
            selectionRef.current = e.nativeEvent.selection;
          }}
          placeholder="Message... (type @ to mention a project)"
          placeholderTextColor={colors.text.disabled}
          multiline
        />

        {isSending ? (
          <ActivityIndicator size="small" color={colors.mediumOrange} style={styles.sendButton} />
        ) : (
          <CustomButton
            title="Send"
            onPress={handleSend}
            disabled={!canSend}
            style={styles.sendButton}
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
