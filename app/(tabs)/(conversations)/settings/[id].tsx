import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { GroupNameModal } from '@components/modals/GroupNameModal';
import { MemberAvatar } from '@components/users/MemberAvatar';
import { LoadingIndicator } from '@components/ui';
import { ConversationParticipant } from 'schemas';

export default function ConversationSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: me } = useMe();
  const { data: conversation, isLoading } = useConversation(id);
  const { data: allUsers } = useUsers();

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Determinăm adminul efectiv:
  // 1. dacă adminId există și persoana e încă în grup → ea e admin
  // 2. altfel → cel mai vechi participant (joinedAt ASC)
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

  // Utilizatori care nu sunt deja participanți (pentru Add)
  const nonParticipantUsers = (allUsers ?? []).filter(
    (u) => !participants.some((p) => p.userId === u.id),
  );

  const handleRename = (name: string) => {
    updateName.mutate(name, {
      onSuccess: () => setShowRenameModal(false),
      onError: () => Alert.alert('Error', 'Could not rename the group.'),
    });
  };

  const handleUploadCover = (localUri: string) => {
    updateCover.mutate(localUri, {
      onError: () => Alert.alert('Error', 'Could not upload group photo.'),
    });
  };

  const handleRemoveCover = () => {
    Alert.alert('Remove Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          deleteCover.mutate(undefined, {
            onError: () => Alert.alert('Error', 'Could not remove photo.'),
          }),
      },
    ]);
  };

  const handleAddParticipant = (userId: string) => {
    addParticipants.mutate([userId], {
      onSuccess: () => setShowAddModal(false),
      onError: () => Alert.alert('Error', 'Could not add participant.'),
    });
  };

  const handleRemoveParticipant = (participant: ConversationParticipant) => {
    Alert.alert(
      'Remove Participant',
      `Remove ${participant.user.name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            removeParticipant.mutate(participant.userId, {
              onError: () => Alert.alert('Error', 'Could not remove participant.'),
            }),
        },
      ],
    );
  };

  const handleLeave = () => {
    const isLastAdmin = isAdmin && participants.length <= 1;
    Alert.alert(
      'Leave Chat',
      isLastAdmin
        ? 'You are the only member. Leaving will delete this group.'
        : isAdmin
        ? 'You are the admin. Admin role will be transferred to the next member.'
        : 'Are you sure you want to leave this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () =>
            leaveConversation.mutate(undefined, {
              onSuccess: () => router.replace('/(tabs)/(conversations)'),
              onError: () => Alert.alert('Error', 'Could not leave the chat.'),
            }),
        },
      ],
    );
  };

  const coverLoading = updateCover.isPending || deleteCover.isPending;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* GROUP AVATAR */}
        {isGroup && (
          <View style={styles.avatarSection}>
            <GroupAvatar
              uri={conversation.coverUrl}
              name={conversation.name}
              isAdmin={true}
              isLoading={coverLoading}
              onUpload={handleUploadCover}
              onRemove={handleRemoveCover}
              size={110}
            />

            {/* Rename button — toți participanții pot redenumi */}
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

        {/* PARTICIPANTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Participants ({participants.length})
            </Text>
            {isGroup && isAdmin && (
              <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                <Ionicons name="person-add" size={16} color={colors.mediumOrange} />
                <Text style={styles.addLabel}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {participants.map((participant) => {
            const isParticipantAdmin = participant.userId === effectiveAdminId;
            const isSelf = participant.userId === me.id;

            return (
              <View key={participant.id} style={styles.participantRow}>
                <MemberAvatar member={participant.user} size={42} />
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.user.name}
                    {isSelf ? ' (you)' : ''}
                  </Text>
                  {isParticipantAdmin && isGroup && (
                    <View style={styles.adminBadge}>
                      <Ionicons name="shield-checkmark" size={11} color={colors.mediumOrange} />
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>

                {/* Remove button — admin only, not self */}
                {isAdmin && !isSelf && isGroup && (
                  <TouchableOpacity
                    onPress={() => handleRemoveParticipant(participant)}
                    style={styles.removeButton}
                    disabled={removeParticipant.isPending}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.text.error} />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* LEAVE BUTTON */}
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
              <Text style={styles.leaveLabel}>Leave Chat</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* RENAME MODAL */}
      <GroupNameModal
        visible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSubmit={handleRename}
        initialName={conversation.name}
        title="Rename Group"
        submitLabel="Save"
      />

      {/* ADD PARTICIPANT MODAL */}
      {showAddModal && (
        <View style={styles.addModalOverlay}>
          <View style={styles.addModal}>
            <View style={styles.addModalHeader}>
              <Text style={[textPresets.headerMedium, { color: colors.text.primary }]}>
                Add Participant
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {nonParticipantUsers.length === 0 ? (
                <Text style={styles.emptyText}>All users are already in the group.</Text>
              ) : (
                nonParticipantUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.participantRow}
                    onPress={() => handleAddParticipant(user.id)}
                    disabled={addParticipants.isPending}
                  >
                    <MemberAvatar member={user} size={38} />
                    <Text style={[styles.participantName, { marginLeft: 10 }]} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Ionicons name="add-circle-outline" size={22} color={colors.mediumBlue} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
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
  groupNameLabel: {
    color: colors.white,
    marginTop: 10,
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

  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    ...textPresets.bodyMedium,
    color: colors.text.primary,
    fontWeight: '500',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  adminBadgeText: {
    ...textPresets.caption,
    color: colors.mediumOrange,
    fontWeight: '700',
  },
  removeButton: {
    padding: 4,
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

  addModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  addModal: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    ...textPresets.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
