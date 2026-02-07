import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { ID, Message } from 'schemas';

interface Props{
  message: Message;
  participants: any[];
  currentUserId: ID;
  isGroup: boolean;
}
export const ReadStatus = ({ message, participants, currentUserId, isGroup } : Props) => {
  const readers = participants.filter(p => 
    p.userId !== currentUserId && 
    p.lastReadAt && 
    new Date(p.lastReadAt).getTime() >= new Date(message.createdAt).getTime()
  );

  if (readers.length === 0) {
    return !isGroup ? (
      <View style={styles.readStatusContainer}>
        <Ionicons name="checkmark" size={16} color={colors.white} />
      </View>
    ) : null;
  }

  return (
    <View style={styles.readStatusContainer}>
      {isGroup ? (
        <Text style={styles.readStatusText} numberOfLines={1}>
          {readers.length > 3 
            ? `Seen by ${readers[0].user.name} and ${readers.length - 1} others`
            : `Seen by ${readers.map(r => r.user.name).join(', ')}`}
        </Text>
      ) : (
        <Ionicons name="checkmark-done" size={16} color={colors.white} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  readStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 12,
  },
  readStatusText: {
    fontSize: 12,
    color: colors.white,
  },
});