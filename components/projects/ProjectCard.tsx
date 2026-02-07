import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, Platform } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { formatRelativeDate } from '@utils/index';
import { ProjectStatus, Project } from 'schemas';
import { useProjectMembers } from '@hooks/queries/useProjectMembers';
import { MemberAvatarsList } from '../users';
import { LoadingIndicator, Tag } from '../ui';
import { CompletedTasksProgress } from '../tasks';


interface ProjectCardProps {
  item: Project;
  onPress: (project: Project) => void;
  isCompleted?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ item, onPress, isCompleted = false }) => {

  const { data: members = [], isLoading } = useProjectMembers(item.id);

  const formattedDeadline = useMemo(() => {
    if (isCompleted) return 'Project completed'
    else return formatRelativeDate(item.deadline) || 'No deadline'
  }, [item.deadline] );

  const handlePress = useCallback(() => {
    if(isCompleted && Platform.OS === 'android') ToastAndroid.show('This project is completed', ToastAndroid.SHORT);
      onPress(item);
  }, [onPress, item]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.completedCard]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.textSection}>
          <View style={styles.tagsContainer}>
            {item.status === ProjectStatus.NEW && (
              <Tag
                title="New"
                backgroundColor={colors.taskStatus.NEW.color}
                textColor={colors.white}
              />
            )}
            <Tag title={item.category.name} />
          </View>

          <Text style={[textPresets.headerSmall, styles.projectName]}>
            {item.name}
          </Text>

          {item.description && (
            <Text
              style={[textPresets.bodyMedium, styles.projectDescription]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.description}
            </Text>
          )}

          <View style={styles.membersContainer}>
            <MemberAvatarsList members={members|| []} />
          </View>
        </View>

        <View style={styles.progressSection}>
          <CompletedTasksProgress projectId={item.id} />

          <View style={styles.deadlineContainer}>
            <Text style={[textPresets.bodySmall, styles.deadline]}>
              {formattedDeadline}
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
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    margin: 5,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: colors.background.disabled,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  projectName: {
    marginBottom: 2,
  },
  projectDescription: {
    marginBottom: 3,
    color: colors.text.secondary,
  },
  membersContainer: {
    marginTop: 6,
    maxWidth: 180,
  },
  projectTeam: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.mediumOrange,
  },
  progressSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineContainer: {
    marginTop: 6,
  },
  deadline: {
    color: colors.mediumOrange,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
