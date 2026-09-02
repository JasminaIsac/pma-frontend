import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '@components/modals/ConfirmModal';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';
import { useMe } from '@hooks/queries/useMe';
import {
  useConversation,
  useUpdateConversationName,
  useUpdateConversationCover,
  useDeleteConversationCover,
  useAddParticipants,
  useRemoveParticipant,
  useLeaveConversation,
} from '@hooks/queries/useConversations';
import { useUsers } from '@hooks/queries/useUsers';
import { GroupAvatar } from '@components/chat/GroupAvatar';
import { ParticipantRow } from '@components/chat/ParticipantRow';
import { AddParticipantModal } from '@components/chat/AddParticipantModal';
import { GroupNameModal } from '@components/modals/GroupNameModal';
import { LoadingIndicator } from '@components/ui';
import { ConversationParticipant } from 'schemas';

export default function ConversationSettingsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: me } = useMe();
  const { data: conversation, isLoading } = useConversation(id);
  const { data: allUsers } = useUsers();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { confirm, modalProps: confirmModalProps } = useConfirmModal();

  const updateName = useUpdateConversationName(id);
  const updateCover = useUpdateConversationCover(id);
  const deleteCover = useDeleteConversationCover(id);
  const addParticipants = useAddParticipants(id);
  const removeParticipant = useRemoveParticipant(id);
  const leaveConversation = useLeaveConversation(id);

  if (isLoading || !me) return <LoadingIndicator />;
  if (!conversation) return null;

  const isGroup = conversation.type === 'GROUP';
  const participants: ConversationParticipant[] = conversation.participants ?? [];

  const effectiveAdminId: string | null = (() => {
    if (!isGroup) return null;
    const adminStillInGroup = participants.some((p) => p.userId === conversation.adminId);
    if (adminStillInGroup && conversation.adminId) return conversation.adminId;
    const sorted = [...participants].sort(
      (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    );
    return sorted[0]?.userId ?? null;
  })();

  const isAdmin = effectiveAdminId === me.id;

  const nonParticipantUsers = (allUsers ?? []).filter(
    (u) => !participants.some((p) => p.userId === u.id),
  );

  const handleRename = (name: string) => {
    updateName.mutate(name, {
      onSuccess: () => setShowRenameModal(false),
      onError: () => Alert.alert(t('common.errorTitle'), t('conversations.couldNotRename')),
    });
  };

  const handleUploadCover = (localUri: string) => {
    updateCover.mutate(localUri, {
      onError: () => Alert.alert(t('common.errorTitle'), t('conversations.couldNotUploadCover')),
    });
  };

  const handleRemoveCover = () => {
    confirm({
      title: t('conversations.removePhoto'),
      message: t('common.areYouSure'),
      confirmLabel: t('common.remove'),
      onConfirm: () =>
        deleteCover.mutate(undefined, {
          onError: () => Alert.alert(t('common.errorTitle'), t('conversations.couldNotRemoveCover')),
        }),
    });
  };

  const handleAddParticipant = (userId: string) => {
    addParticipants.mutate([userId], {
      onSuccess: () => setShowAddModal(false),
      onError: () => Alert.alert(t('common.errorTitle'), t('conversations.couldNotAddParticipant')),
    });
  };

  const handleRemoveParticipant = (participant: ConversationParticipant) => {
    confirm({
      title: t('conversations.removeParticipant'),
      message: t('conversations.removeConfirm', { name: participant.user.name }),
      confirmLabel: t('common.remove'),
      onConfirm: () =>
        removeParticipant.mutate(participant.userId, {
          onError: () => Alert.alert(t('common.errorTitle'), t('conversations.couldNotRemoveParticipant')),
        }),
    });
  };

  const handleLeave = () => {
    const isLastAdmin = isAdmin && participants.length <= 1;
    confirm({
      title: t('conversations.leaveChat'),
      message: isLastAdmin
        ? t('conversations.leaveConfirmLastAdmin')
        : isAdmin
        ? t('conversations.leaveConfirmAdmin')
        : t('conversations.leaveConfirm'),
      confirmLabel: t('conversations.leave'),
      onConfirm: () =>
        leaveConversation.mutate(undefined, {
          onSuccess: () => router.replace('/(tabs)/(conversations)'),
          onError: () => Alert.alert(t('common.errorTitle'), t('conversations.couldNotLeave')),
        }),
    });
  };

  const coverLoading = updateCover.isPending || deleteCover.isPending;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {isGroup && (
          <View style={styles.avatarSection}>
            <GroupAvatar
              uri={conversation.coverUrl}
              name={conversation.name}
              canEdit={isGroup}
              isLoading={coverLoading}
              onUpload={handleUploadCover}
              onRemove={handleRemoveCover}
              size={110}
            />
            <TouchableOpacity
              style={styles.renameButton}
              onPress={() => setShowRenameModal(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="pencil" size={14} color={colors.mediumBlue} />
              <Text style={styles.renameLabel}>{conversation.name}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('conversations.participantsCount', { count: participants.length })}
            </Text>
            {isGroup && isAdmin && (
              <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                <Ionicons name="person-add" size={16} color={colors.mediumOrange} />
                <Text style={styles.addLabel}>{t('common.add')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {participants.map((participant) => (
            <ParticipantRow
              key={participant.id}
              participant={participant}
              isSelf={participant.userId === me.id}
              isParticipantAdmin={participant.userId === effectiveAdminId}
              isGroup={isGroup}
              canRemove={isAdmin && participant.userId !== me.id && isGroup}
              isRemoving={removeParticipant.isPending}
              onRemove={() => handleRemoveParticipant(participant)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeave}
          disabled={leaveConversation.isPending}
          activeOpacity={0.8}
        >
          {leaveConversation.isPending ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="exit-outline" size={20} color={colors.white} />
              <Text style={styles.leaveLabel}>{t('conversations.leaveChat')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <GroupNameModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSubmit={handleRename}
        initialName={conversation.name}
        title={t('conversations.renameGroup')}
        submitLabel={t('common.save')}
      />

      {showAddModal && (
        <AddParticipantModal
          users={nonParticipantUsers}
          isPending={addParticipants.isPending}
          onAdd={handleAddParticipant}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <ConfirmModal {...confirmModalProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { padding: 20, paddingBottom: 50 },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  renameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background.primary,
    borderRadius: 20,
  },
  renameLabel: {
    ...textPresets.bodyMediumBold,
    color: colors.darkBlue,
  },

  section: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...textPresets.bodySmallBold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addLabel: {
    ...textPresets.bodySmallBold,
    color: colors.mediumOrange,
  },

  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.button.delete,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  leaveLabel: {
    ...textPresets.bodyMediumBold,
    color: colors.white,
  },
});
