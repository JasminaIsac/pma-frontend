import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import {
  View, FlatList, ActivityIndicator, Text, Image, StyleSheet,
  KeyboardAvoidingView, TouchableOpacity, Share, Platform, Keyboard
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, textPresets } from "@theme/index";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useMe } from "@hooks/queries/useMe";
import { getConversationMessagesCursor } from "api/messages";
import { getConversationById } from "api/conversation";
import { useChatSocket } from "@hooks/useChatSocket";
import { useTypingIndicator } from "@hooks/useTypingIndicator";
import { Message, Conversation, ConversationParticipant } from "schemas";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  MessageBubble, MessageInput, ReadStatus, MemberAvatarsList, LoadingIndicator,
  MessageActionSheet, EditMessageModal,
} from "@components/index";
import { ConfirmModal } from "@components/modals/ConfirmModal";
import { useConfirmModal } from "@hooks/useConfirmModal";
import { formatEnum } from "@utils/enumsHelpers";

const MESSAGES_PAGE_SIZE = 20;

const MessagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { data: user } = useMe();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const socket = useChatSocket();
  const navigation = useNavigation();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ConversationParticipant[]>([]);
  const isGroup = participants.length > 2;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const { typingText, handleTyping, stopTyping, setUserTyping, clearUserTyping } =
    useTypingIndicator({ socket, conversationId, userId: user?.id, userName: user?.name });

  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setAndroidKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKeyboardHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  const canModify = (msg: Message) =>
    new Date(msg.createdAt).getTime() + 15 * 60 * 1000 > Date.now();

  const fetchConversationDetails = async () => {
    try {
      const data = await getConversationById(conversationId);
      setConversation(data);
      if (data.participants) setParticipants(data.participants);
    } catch (err) {
      console.error("Failed to fetch conversation details:", err);
    }
  };

  useEffect(() => {
    if (conversationId) fetchConversationDetails();
  }, [conversationId]);

  const fetchMessages = async (cursorParam?: string) => {
    try {
      const response = await getConversationMessagesCursor(conversationId, MESSAGES_PAGE_SIZE, cursorParam);
      if (response?.items) {
        setMessages(prev => cursorParam ? [...prev, ...response.items] : response.items);
        setCursor(response.nextCursor ?? undefined);
        setHasMore(response.hasMore);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!conversationId || conversationId === 'undefined') return;
    setLoading(true);
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (socket && conversationId && user?.id) {
      socket.emit('mark_as_read', { conversationId, userId: user.id });
    }
  }, [conversationId, messages.length]);

  // --- Socket listeners ---
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("join_conversation", { conversationId });

    const onReceiveMessage = (msg: Message) => {
      clearUserTyping(msg.senderId);
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [msg, ...prev];
      });
    };

    const onUserReadUpdate = ({ userId, lastReadAt }: any) => {
      setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, lastReadAt } : p));
    };

    const onUserTyping = ({ userId, name }: { userId: string; name: string }) => {
      if (userId === user?.id) return;
      setUserTyping(userId, name);
    };

    const onUserStoppedTyping = ({ userId }: { userId: string }) => {
      clearUserTyping(userId);
    };

    const onMessageEdited = ({ messageId, newText }: { messageId: string; newText: string }) => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, message: newText, updatedAt: new Date().toISOString() } : m)
      );
    };

    const onMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, deletedAt: new Date().toISOString() } : m)
      );
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("user_read_update", onUserReadUpdate);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stopped_typing", onUserStoppedTyping);
    socket.on("message_edited", onMessageEdited);
    socket.on("message_deleted", onMessageDeleted);

    return () => {
      socket.emit("leave_conversation", { conversationId });
      socket.off("receive_message", onReceiveMessage);
      socket.off("user_read_update", onUserReadUpdate);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stopped_typing", onUserStoppedTyping);
      socket.off("message_edited", onMessageEdited);
      socket.off("message_deleted", onMessageDeleted);
      stopTyping();
    };
  }, [socket, conversationId, user?.id]);

  const loadMore = () => {
    if (!loadingMore && hasMore && cursor) {
      setLoadingMore(true);
      fetchMessages(cursor);
    }
  };

  const sendMessageViaSocket = (text: string, attachmentIds: string[], mentionsData: string | null) => {
    if (!socket || !user) return;
    stopTyping();
    const payload: Record<string, any> = { conversationId, senderId: user.id, message: text };
    if (attachmentIds.length > 0) payload.attachmentIds = attachmentIds;
    if (mentionsData) payload.mentionsData = mentionsData;
    socket.emit('send_message', payload);
  };

  const handleLongPress = useCallback((message: Message) => {
    setActionMessage(message);
  }, []);

  const handleCopyAction = useCallback(async () => {
    if (!actionMessage) return;
    await Share.share({ message: actionMessage.message || '' });
    setActionMessage(null);
  }, [actionMessage]);

  const handleEditAction = useCallback(() => {
    if (!actionMessage) return;
    setEditingMessage(actionMessage);
    setEditText(actionMessage.message);
    setActionMessage(null);
  }, [actionMessage]);

  const handleDeleteAction = useCallback(() => {
    if (!actionMessage || !user) return;
    setActionMessage(null);
    confirm({
      title: t('conversations.deleteMessage'),
      message: t('conversations.deleteMessageConfirm'),
      confirmLabel: t('common.delete'),
      onConfirm: () => socket?.emit('delete_message', { messageId: actionMessage.id, senderId: user.id }),
    });
  }, [actionMessage, user, socket, confirm]);

  const handleSaveEdit = useCallback(() => {
    if (!editingMessage || !user || !socket) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    socket.emit('edit_message', { messageId: editingMessage.id, senderId: user.id, newText: trimmed });
    setEditingMessage(null);
    setEditText('');
  }, [editingMessage, editText, user, socket]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await fetchMessages(); } catch { } finally { setRefreshing(false); }
  };


  useLayoutEffect(() => {
    const otherParticipants = participants?.filter(p => p.userId !== user?.id) || [];
    const otherParticipantUser = otherParticipants[0]?.user;
    const title = isGroup ? conversation?.name : otherParticipantUser?.name;

    const handleHeaderPress = () => {
      if (isGroup) {
        router.push(`/(tabs)/(conversations)/settings/${conversationId}` as any);
      } else if (otherParticipantUser?.id) {
        router.push({ pathname: '/(tabs)/(conversations)/user/[id]', params: { id: otherParticipantUser.id } } as any);
      }
    };

    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleHeaderPress} activeOpacity={0.75}>
          {isGroup && conversation?.coverUrl ? (
            <Image source={{ uri: conversation.coverUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
          ) : (
            <MemberAvatarsList members={otherParticipants} />
          )}
          <View style={{ alignItems: 'flex-start', marginLeft: 10 }}>
            <Text style={[textPresets.headerMedium, { color: colors.text.primary, marginBottom: 1 }]}>
              {title || t('conversations.loadingMessages')}
            </Text>
            {conversation && !isGroup && (
              <Text style={{ fontSize: 10, color: "#009a28" }}>{formatEnum(otherParticipantUser?.status)}</Text>
            )}
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }} onPress={() => router.push(`/(tabs)/(conversations)/settings/${conversationId}` as any)}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, conversation, participants, user?.id, isGroup]);

  if (!user) return null;

  return (
    <LinearGradient style={styles.container} colors={colors.orangeGradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, marginBottom: Platform.OS === 'android' ? androidKeyboardHeight : 0 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        {loading && <LoadingIndicator />}

        {messages.length === 0 && !loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={[textPresets.noData, { color: colors.white }]}>{t('conversations.noMessages')}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            extraData={participants}
            inverted
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              const isOwn = item.senderId === user.id;
              return (
                <View style={{ marginBottom: index === 0 ? 10 : 2 }}>
                  <MessageBubble
                    message={item}
                    isOwn={isOwn}
                    onAvatarPress={(userId) => router.push({ pathname: '/(tabs)/(conversations)/user/[id]', params: { id: userId } } as any)}
                    onLongPress={handleLongPress}
                  />
                  {index === 0 && isOwn && (
                    <ReadStatus message={item} participants={participants} currentUserId={user.id} isGroup={isGroup} />
                  )}
                </View>
              );
            }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={loadingMore ? (
              <View style={styles.loaderFooter}><ActivityIndicator size="small" color={colors.mediumOrange} /></View>
            ) : <View style={{ height: 20 }} />}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          />
        )}

        {typingText && (
          <View style={styles.typingBar}>
            <Text style={styles.typingText}>{typingText}</Text>
          </View>
        )}

        <View style={[styles.inputWrapper, { paddingBottom: bottomInset }]}>
          <MessageInput onSendMessage={sendMessageViaSocket} onTyping={handleTyping} />
        </View>
      </KeyboardAvoidingView>

      <MessageActionSheet
        message={actionMessage}
        currentUserId={user.id}
        canModify={canModify}
        onClose={() => setActionMessage(null)}
        onCopy={handleCopyAction}
        onEdit={handleEditAction}
        onDelete={handleDeleteAction}
      />

      <EditMessageModal
        message={editingMessage}
        text={editText}
        onChangeText={setEditText}
        onSave={handleSaveEdit}
        onClose={() => { setEditingMessage(null); setEditText(''); }}
      />

      <ConfirmModal {...confirmModalProps} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.accentOrange },
  inputWrapper: {
    backgroundColor: colors.background.primary,
  },
  loaderFooter: { paddingVertical: 20, alignItems: 'center' },
  typingBar: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  typingText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.white,
    opacity: 0.85,
  },
});

export default MessagesScreen;
