import { useEffect, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { useAuth } from '@contexts/AuthContext';
import { getConversationsCursor } from '@api/conversation';
import { useChatSocket } from '@hooks/useChatSocket';
import { LoadingIndicator, ConversationCard, SearchBar } from '@components/index';
import { Conversation, Message } from 'schemas';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 15;

const ConversationsScreen = () => {
  const { userId: currentUserId } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const socket = useChatSocket();
  const { t } = useTranslation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = useCallback(async (cursorParam?: string) => {
    if (!currentUserId) return;
    try {
      if (cursorParam) setLoadingMore(true);
      else setLoading(true);

      const res = await getConversationsCursor(PAGE_SIZE, cursorParam);

      setConversations(prev =>
        cursorParam ? [...prev, ...res.items] : res.items
      );
      setCursor(res.nextCursor ?? undefined);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  useEffect(() => {
    if (!socket || !currentUserId) return;

    socket.emit('join_user_room', { userId: currentUserId });

    const handleNewUpdate = (payload: any) => {
      const incomingMsg: Message = payload.lastMessage || payload;

      setConversations(prev => {
        const updatedList = [...prev];
        const index = updatedList.findIndex(c => c.id === incomingMsg.conversationId);

        if (index > -1) {
          const oldConv = updatedList[index];
          const isMine = incomingMsg.senderId === currentUserId;

          const updatedConv: Conversation = {
            ...oldConv,
            lastMessage: incomingMsg,
            updatedAt: incomingMsg.createdAt,
            participants: (oldConv.participants ?? []).map(p => {
              if (p.userId === currentUserId && isMine) {
                return { ...p, lastReadAt: incomingMsg.createdAt };
              }
              return p;
            })
          };

          updatedList.splice(index, 1);
          updatedList.unshift(updatedConv);
        } else {
          fetchConversations();
        }
        return updatedList;
      });
    };

    socket.on('receive_message', handleNewUpdate);
    socket.on('conversation_updated', handleNewUpdate);

    return () => {
      socket.off('receive_message', handleNewUpdate);
      socket.off('conversation_updated', handleNewUpdate);
    };
  }, [socket, currentUserId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && cursor) {
      fetchConversations(cursor);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(conv => {
      if (conv.name?.toLowerCase().includes(q)) return true;
      const others = conv.participants.filter(p => p.userId !== currentUserId);
      return others.some(p => p.user?.name?.toLowerCase().includes(q));
    });
  }, [conversations, searchQuery, currentUserId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => router.push('/(tabs)/(conversations)/add')} style={{ marginRight: 15 }}>
          <Ionicons name="add-circle-outline" size={28} color={colors.mediumOrange} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading && conversations.length === 0) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={`${t('common.search')}...`}
      />
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationCard 
            conversation={item} 
            currentUserId={currentUserId!} 
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.mediumOrange} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.text.secondary} />
            <Text style={[textPresets.bodyMedium, styles.emptyText]}>
              {t('conversations.noConversations')}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: colors.text.secondary,
    marginTop: 16,
  },
  searchBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
});

export default ConversationsScreen;