import { useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CustomInput, CustomButton, LabeledPicker, LoadingIndicator } from '@components/index';
import { colors } from '@theme/index';
import { useUser, useUpdateUser, useDeleteUser, useUserProjectsCount } from '@hooks/queries/useUsers';
import { UserRole, UserStatus, ID } from 'schemas/index';
import { useToastNotification } from '@hooks/useToastNotification';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tel: z.string().optional(),
  location: z.string().optional(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
});

type EditUserFormValues = z.infer<typeof userSchema>;

const EditUserScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { showSuccess, showError } = useToastNotification();

  const { data: user, isLoading: loadingUser } = useUser(userId as ID);
  const { data: projectsCount } = useUserProjectsCount(userId as ID);
  const { mutate: updateUserMutate, isPending: updating } = useUpdateUser();
  const { mutate: deleteUserMutate, isPending: deleting } = useDeleteUser();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditUserFormValues>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        tel: user.tel ?? '',
        location: user.location ?? '',
        role: user.role,
        status: user.status,
      });
    }
  }, [user, reset]);

  const onSave = async (data: EditUserFormValues) => {
    if (!user) return;

    updateUserMutate(
      { id: user.id, data },
      {
        onSuccess: () => {
          showSuccess('Success', 'User updated successfully');
          setTimeout(() => router.back(), 200);
        },
        onError: () => showError('Error', 'Failed to update user'),
      }
    );
  };


  const onDelete = async () => {
    if (!user) return;

    if (projectsCount && projectsCount > 0) {
      Alert.alert('Error', 'User is involved in projects and cannot be deleted');
      return;
    }

    Alert.alert('Confirm', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteUserMutate(user.id, {
            onSuccess: () => {
              showSuccess('Deleted', 'User deleted successfully');
              router.push('/tabs/users');
            },
            onError: () => showError('Error', 'Failed to delete user'),
          });
        },
      },
    ]);
  };

  if (loadingUser) {
    return <LoadingIndicator />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CustomInput
            control={control}
            name="name"
            label="Name"
            placeholder="Name"
            error={errors.name?.message}
          />
          <CustomInput
            control={control}
            name="tel"
            label="Tel"
            placeholder="Tel"
            error={errors.tel?.message}
          />
          <LabeledPicker
            control={control}
            name="role"
            label="Role"
            placeholder="Role"
            items={[
              { label: 'Admin', value: UserRole.ADMIN },
              { label: 'Project Manager', value: UserRole.PROJECT_MANAGER },
              { label: 'Developer', value: UserRole.DEVELOPER },
            ]}
            error={errors.role?.message}
          />
          <CustomInput
            control={control}
            name="location"
            label="Location"
            placeholder="Location"
            error={errors.location?.message}
          />
          <LabeledPicker
            control={control}
            name="status"
            label="Status"
            placeholder="Status"
            items={[
              { label: 'Active', value: UserStatus.ACTIVE },
              { label: 'Inactive', value: UserStatus.INACTIVE },
              { label: 'Banned', value: UserStatus.BANNED },
              { label: 'Deleted', value: UserStatus.DELETED },
            ]}
            error={errors.status?.message}
          />
          <CustomButton
            title="Save Changes"
            onPress={handleSubmit(onSave)}
            disabled={updating}
          />
          <CustomButton
            title="Delete User"
            onPress={onDelete}
            type="delete"
            disabled={deleting}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
});

export default EditUserScreen;
