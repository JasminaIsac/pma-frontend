import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tag from '../ui/Tag';
import { colors, textPresets } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';
import { getStatusTagData, formatDate } from '@utils/index';
import { Project, ProjectMember } from 'schemas';
import { MemberAvatarsList } from '../users';
import { CompletedTasksProgress } from '../tasks';

interface ProjectDetailsProps {
  project: Project;
  members: ProjectMember[];
}

export const ProjectDetails = ({ project, members }: ProjectDetailsProps) => {
  const formattedDeadline = formatDate(project.deadline);
  const formattedCreatedAt = formatDate(project.createdAt);
  const formattedUpdatedAt = formatDate(project.updatedAt);
  
  const statusData = getStatusTagData(project.status as string);

  return (
    <View style={styles.projectDetails}>
      <View style={{ flex: 2 }}>
        <Text style={[textPresets.headerLarge, { color: '#fff' }]}>{project.name}</Text>
        <View style={styles.tagsContainer}>
          <Tag title={project.category.name} />
          <Tag title={statusData.title} backgroundColor={statusData.color} textColor="#fff"/>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={[textPresets.bodyMedium, { color: '#fff' }]}>{project.description}</Text>

          <View style={styles.membersContainer}>
            <Ionicons name="people" size={20} color={colors.mediumOrange} />
            <MemberAvatarsList members={members} size={30} maxVisible={10}/>
          </View>

          <View style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="time" size={14} color={colors.lightBlue} />
              <Text style={[textPresets.bodySmallBold, { color: colors.lightBlue }]}>
                Created: <Text style={textPresets.bodySmall}>{formattedCreatedAt}</Text>
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="time" size={14} color={colors.lightBlue} />
              <Text style={[textPresets.bodySmallBold, { color: colors.lightBlue }]}>
                Last Updated: <Text style={textPresets.bodySmall}>{formattedUpdatedAt}</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, alignSelf: 'flex-end', alignItems: 'flex-end' }}>
        <CompletedTasksProgress
          projectId={project.id}
          color={{ active: '#fff', inActive: colors.darkBlue }}
        />
        <Text style={[textPresets.bodyMediumBold, { color: '#fff', marginTop: 10, textAlign: 'center' }]}>
          {formattedDeadline}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  projectDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  descriptionContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 8,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});