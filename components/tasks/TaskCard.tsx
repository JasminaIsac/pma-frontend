import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, textPresets } from '@theme/index';
import { TaskPriority, TaskStatus, TaskWithRelations, ID } from 'schemas';
import { Tag } from '../ui';

interface TaskCardProps {
  item: TaskWithRelations;
}

export const TaskCard = ({ item } : TaskCardProps) => {
  const router = useRouter();
  const deadline = item.deadline ? new Date(item.deadline) : null;

  const formatDate = (date: Date) => {
    if (!date) return { day: '', month: '', year: '' };
    const day = date.getDate();
    const month = date.toLocaleString('en-CA', { month: 'short' });
    const year = date.getFullYear();
    return { day, month, year };
  };

  const { day, month, year } = formatDate(deadline || new Date());

  const handleTaskPress = (taskId: ID | string) => {
    router.push({ pathname: '/(tasks)/view/[id]', params: { id: taskId } });
  };

  const getPriorityTagData = (priority?: TaskPriority) => {
    const data = priority ? colors.priority[priority] : undefined;
    return data
      ? { title: data.label, color: data.color, textColor: '#fff' }
      : { title: priority || 'Normal', color: '#95a5a6', textColor: '#fff' };
  };

  const getStatusData = (status: TaskStatus) => {
    return colors.taskStatus[status] || { color: '#95a5a6', label: status };
  };

  const statusData = getStatusData(item.status);

  return (
    <TouchableOpacity
      style={[styles.card, item.status === TaskStatus.COMPLETED && styles.completedCard]}
      onPress={() => handleTaskPress(item.id)}
    >
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
          {(() => {
            const { title, color, textColor } = getPriorityTagData(item.priority);
            return <Tag title={title} backgroundColor={color} textColor={textColor} style={{ marginRight: 5 }} />;
          })()}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[styles.statusLabel, { color: statusData.color, marginRight: 5 }]}>●</Text>
            <Text style={[textPresets.bodySmallBold]}>{statusData.label}</Text>
          </View>
        </View>

        <Text
          style={[
            textPresets.bodySmallBold,
            { color: colors.text.accentBlue, marginRight: 15, textAlign: 'right' },
          ]}
        >
          {item.assignee?.name || 'Unassigned'}
        </Text>
      </View>

      <View style={[styles.cardContent, item.status === TaskStatus.COMPLETED && styles.completedCard]}>
        <View style={styles.textSection}>
          <Text style={[textPresets.headerMedium, { marginBottom: 5 }]}>{item.name}</Text>
          {item.description && (
            <Text style={[textPresets.bodySmall, { color: colors.text.secondary }]} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.infoSection}>
          <View>
            <Text style={[styles.deadline, styles.deadlineDate]}>{day}</Text>
            <Text style={styles.deadline}>
              {month}, {year}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 15,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 2, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
  },
  completedCard: {
    backgroundColor: colors.background.disabled,
  },
  cardContent: {
    backgroundColor: colors.background.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textSection: {
    flex: 4,
  },
  infoSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontWeight: '700',
  },
  deadline: {
    fontSize: 14,
    color: '#ff9800',
    textAlign: 'center',
    fontWeight: 700,
  },
  deadlineDate: {
    fontSize: 22,
    fontWeight: '900',
  },
});