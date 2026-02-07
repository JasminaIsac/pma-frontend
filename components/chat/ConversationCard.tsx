import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { colors, textPresets } from "@theme/index";
import { Conversation } from "schemas";
import { formatRelativeDate } from "@utils/dateHelpers";
import { MemberAvatar } from "../users/MemberAvatar";

interface ConversationCardProps {
  conversation: Conversation;
  currentUserId: string;
}

export const ConversationCard = ({ conversation, currentUserId }: ConversationCardProps) => {
  const router = useRouter();

  const unreadCount = conversation.unreadCount || 0;
  const lastMessage = conversation.lastMessage;

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  )?.user;

  const isGroup = conversation.type === "GROUP";
  const conversationName = conversation.name || otherParticipant?.name || "Grup";

  const displayDate = lastMessage 
    ? new Date(lastMessage.createdAt) 
    : new Date(conversation.updatedAt || conversation.createdAt);

  const finalDate = displayDate.getTime() > Date.now() ? new Date() : displayDate;

  const onPress = () => {
    router.push({ pathname: `/messages/${conversation.id}` });
  };

  return (
    <View style={styles.shadowContainer}>
      <TouchableOpacity style={styles.cardInner} onPress={onPress}>
        <View style={styles.avatarContainer}>
          <MemberAvatar 
            member={(isGroup ? { name: conversationName, avatarUrl: null } : otherParticipant) || { name: '?', avatarUrl: null }} 
            size={55} 
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text 
              style={[
                textPresets.headerMedium, 
                { color: colors.darkBlue, flex: 1 },
                unreadCount > 0 && { fontWeight: '800' }
              ]} 
              numberOfLines={1}
            >
              {conversationName}
            </Text>
            
            <Text style={[
              textPresets.bodySmallBold, 
              { color: unreadCount > 0 ? colors.mediumOrange : colors.text.secondary }
            ]}>
              {formatRelativeDate(finalDate)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text 
              style={[
                textPresets.bodyMedium, 
                { color: unreadCount > 0 ? colors.darkBlue : colors.text.secondary, flex: 1 },
                unreadCount > 0 && { fontWeight: '600' }
              ]} 
              numberOfLines={1}
            >
              {lastMessage 
                ? `${(lastMessage.senderId || lastMessage.sender?.id) === currentUserId ? 'Tu: ' : ''}${lastMessage.message}`
                : ""}
            </Text>
            
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    marginVertical: 7,
    marginHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    overflow: 'visible',
  },
  unreadBadge: {
    backgroundColor: colors.mediumOrange,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  avatarContainer: {
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});