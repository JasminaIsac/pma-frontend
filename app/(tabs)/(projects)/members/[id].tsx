import React, { useMemo } from 'react';
import { Text, StyleSheet, View, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, textPresets } from '@theme/index';
import { AddMemberForm, MemberCard, LoadingIndicator } from '@components/index';
import { useProject } from '@hooks/queries/useProjects';
import { useRemoveUserFromProject, useProjectMembers } from '@hooks/queries/useProjectMembers';
import { useTaskCountByProject } from '@hooks/queries/useTasks';
import { useToastNotification } from '@hooks/useToastNotification';
import { ID, ProjectMember, UserRole } from 'schemas';
import { sortProjectMembers } from '@utils/sortUtils';
import { useMe } from '@hooks/queries/useMe';

export default function ProjectMemberScreen(): React.ReactElement {
  const params = useLocalSearchParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const { showSuccess, showError } = useToastNotification();

  const { data: user } = useMe();
  const { data: project, isLoading: projectLoading } = useProject(projectId as ID);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId as ID);
  const removeMemberMutation = useRemoveUserFromProject(projectId as ID);
  const { data: taskCounts } = useTaskCountByProject(projectId);

  const confirmRemove = (member: ProjectMember) => {
    if (!project) return;

    if (project.managerId === member.user.id) {
      showError('Error', 'You cannot remove the creator of this project.');
      return;
    }

    const memberTaskCount = taskCounts?.find(t => t.userId === member.user.id)?.taskCount ?? 0;

    if (memberTaskCount > 0) {
      showError('Error', 'Cannot remove member with active tasks');
    }

    Alert.alert('Confirm', 'Remove this member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeMemberMutation.mutate(member.id, {
            onSuccess: () =>
              showSuccess('Success', 'Member removed'),
          }),
      },
    ]);
  };

  const membersWithCounts = useMemo(() => {
    if (!members) return [];

    return sortProjectMembers(members, project?.managerId).map(member => ({
      ...member,
      taskCount: taskCounts?.find(t => t.userId.toLowerCase() === member.user.id.toLowerCase())?.taskCount ?? 0,
    }));
  }, [members, project?.managerId, taskCounts]);


  const canEdit = user && user.role !== UserRole.DEVELOPER;

  if (projectLoading || membersLoading) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      {canEdit && <AddMemberForm projectId={projectId as ID}/> }
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ marginBottom: 40 }}
        data={membersWithCounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberCard member={item} taskCount={item.taskCount} onRemove={canEdit ? confirmRemove : null} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[textPresets.noData, {color: colors.text.secondary}]}>No members found</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  title: {
    marginTop: 30,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
