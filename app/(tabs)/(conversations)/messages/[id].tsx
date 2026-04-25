import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { View, FlatList, ActivityIndicator, Text, Image, StyleSheet, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import { colors, textPresets } from "@theme/index";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useMe } from "@hooks/queries/useMe";
import { getConversationMessagesCursor } from "api/messages";
import { getConversationById } from "api/conversation";
import { useChatSocket } from "@hooks/useChatSocket";
import { Message } from "schemas";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MessageBubble, MessageInput, ReadStatus, MemberAvatarsList, LoadingIndicator } from "@components/index";
import { formatEnum } from "@utils/enumsHelpers";

interface Props {
  id: string;
}

const MESSAGES_PAGE_SIZE = 20;

const MessagesScreen: React.FC<Props> = () => {
  const { id: conversationId } = useLocalSearchParams<{id: string;}>();

  const { data: user } = useMe();
  const socket = useChatSocket();
  const navigation = useNavigation();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const isGroup = participants.length > 2;
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Fetch Detalii Conversație
  const fetchConversationDetails = async () => {
    try {
      const data = await getConversationById(conversationId);
      setConversation(data);
      if (data.participants) {
        setParticipants(data.participants);
      }
    } catch (err) {
      console.error("Failed to fetch conversation details:", err);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails();
    }
  }, [conversationId]);

  // Logica de Fetch Mesaje (Paginare)
  const fetchMessages = async (cursorParam?: string) => {
    try {
      const response = await getConversationMessagesCursor(
        conversationId, 
        MESSAGES_PAGE_SIZE, 
        cursorParam
      );

      if (response && response.items) {
        setMessages(prev => {
          if (!cursorParam) {
            return response.items;
          } else {
            return [...prev, ...response.items];
          }
        });

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

  // Initial Fetch
  useEffect(() => {
    if (!conversationId || conversationId === 'undefined') return;
    setLoading(true);
    fetchMessages();
  }, [conversationId]);

  // Mark Message as Read
  useEffect(() => {
    if (socket && conversationId && user?.id) {
      socket.emit('mark_as_read', {
        conversationId,
        userId: user.id
      });
    }
  }, [conversationId, messages.length]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("join_conversation", { conversationId: conversationId });

    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        return [msg, ...prev];
      });
    });

    socket.on("user_read_update", ({ userId, lastReadAt }) => {
      setParticipants(prev => prev.map(p => 
        p.userId === userId ? { ...p, lastReadAt } : p
      ));
    });

    // Cleanup: Ieșim din cameră și scoatem listener-ul
    return () => {
      socket.emit("leave_conversation", { conversationId });
      socket.off("receive_message");
      socket.off("user_read_update");
    };
  }, [socket, conversationId]);

  const loadMore = () => {
    if (!loadingMore && hasMore && cursor) {
      fetchMessages(cursor);
    }
  };

  const sendMessageViaSocket = (
    text: string,
    attachmentIds: string[],
    mentionsData: string | null,
  ) => {
    if (!socket || !user) return;

    const payload: Record<string, any> = {
      conversationId,
      senderId: user.id,
      message: text,
    };

    if (attachmentIds.length > 0) {
      payload.attachmentIds = attachmentIds;
    }

    if (mentionsData) {
      payload.mentionsData = mentionsData;
    }

    socket.emit('send_message', payload);
  };

  // Funcția pentru Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMessages(); 
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({
        tabBarStyle: { display: "none" },
      });
    }

    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: "flex" },
        });
      }
    };
  }, [navigation]);

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
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={handleHeaderPress}
          activeOpacity={0.75}
        >
          {isGroup && conversation?.coverUrl ? (
            <Image
              source={{ uri: conversation.coverUrl }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <MemberAvatarsList members={otherParticipants} />
          )}
          <View style={{ alignItems: 'flex-start', marginLeft: 10 }}>
            <Text style={[textPresets.headerMedium, { color: colors.text.primary, marginBottom: 1 }]}>
              {title || "Loading messages..."}
            </Text>
            {conversation && !isGroup && (
              <Text style={{ fontSize: 10, color: "#009a28" }}>{formatEnum(otherParticipantUser?.status)}</Text>
            )}
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => router.push(`/(tabs)/(conversations)/settings/${conversationId}` as any)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, conversation, participants, user?.id, isGroup]);

  if (!user) return null;

  return (
    <LinearGradient
      style={styles.container}
      colors={colors.orangeGradient}
     > 
      <KeyboardAvoidingView 
        behavior={"padding"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={73}
      >
        {loading && ( <LoadingIndicator /> )}
        {messages.length === 0 ? (
         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={[textPresets.noData, { color: colors.white }]}>No messages yet</Text>
        </View>
        ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          extraData={participants}
          inverted // Index 0 = Bottom (Mesajele noi)
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const isOwn = item.senderId === user.id;
            
            return (
              <View style={{ marginBottom: index === 0 ? 10 : 2 }}>
                <MessageBubble
                  message={item}
                  isOwn={isOwn}
                  onAvatarPress={(userId) => router.push({ pathname: '/(tabs)/(conversations)/user/[id]', params: { id: userId } } as any)}
                />
                {index === 0 && isOwn && (
                  <ReadStatus 
                    message={item}
                    participants={participants}
                    currentUserId={user.id}
                    isGroup={isGroup}
                  />
                )}
              </View>
            );
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={loadingMore ? (
            <View style={styles.loaderFooter}>
              <ActivityIndicator size="small" color={colors.mediumOrange} />
            </View>
          ) : <View style={{ height: 20 }} />}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        />
        )}

        <MessageInput onSendMessage={sendMessageViaSocket} />
      </KeyboardAvoidingView>
  </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.accentOrange,
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...textPresets.noData,
    color: colors.white,
    textAlign: 'center',
  },
});

export default MessagesScreen;