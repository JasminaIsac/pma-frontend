import React, { useMemo } from 'react';
import { Text, StyleSheet, View, FlatList } from 'react-native';
import { ConfirmModal } from '@components/modals/ConfirmModal';
import { useConfirmModal } from '@hooks/useConfirmModal';
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
import { useTranslation } from 'react-i18next';

export default function ProjectMemberScreen(): React.ReactElement {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { showSuccess, showError } = useToastNotification();
  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const { data: user } = useMe();
  const { data: project, isLoading: projectLoading } = useProject(projectId as ID);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId as ID);
  const removeMemberMutation = useRemoveUserFromProject(projectId as ID);
  const { data: taskCounts } = useTaskCountByProject(projectId);

  const confirmRemove = (member: ProjectMember) => {
    if (!project) return;

    if (project.managerId === member.user.id) {
      showError('Error', t('projects.cannotRemoveCreator'));
      return;
    }

    const memberTaskCount = taskCounts?.find(t => t.userId === member.user.id)?.taskCount ?? 0;

    if (memberTaskCount > 0) {
      confirm({
        title: t('common.errorTitle'),
        message: t('projects.cannotRemoveActiveTasks'),
        confirmLabel: t('common.close'),
        alertOnly: true,
        onConfirm: () => {},
      });
      return;
    }

    confirm({
      title: t('projects.members'),
      message: t('projects.removeMemberConfirm'),
      confirmLabel: t('common.remove'),
      onConfirm: () =>
        removeMemberMutation.mutate(member.id, {
          onSuccess: () => showSuccess('Success', t('projects.memberRemoved')),
        }),
    });
  };

  const membersWithCounts = useMemo(() => {
    if (!members) return [];
    return sortProjectMembers(members, project?.managerId).map(member => ({
      ...member,
      taskCount: taskCounts?.find(tc => tc.userId.toLowerCase() === member.user.id.toLowerCase())?.taskCount ?? 0,
    }));
  }, [members, project?.managerId, taskCounts]);

  const canEdit = user && user.role !== UserRole.DEVELOPER;

  if (projectLoading || membersLoading) return <LoadingIndicator />;

  return (
    <View style={styles.container}>
      {canEdit && <AddMemberForm projectId={projectId as ID} />}
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
            <Text style={[textPresets.noData, { color: colors.text.secondary }]}>{t('projects.noMembersFound')}</Text>
          </View>
        )}
      />
      <ConfirmModal {...confirmModalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
