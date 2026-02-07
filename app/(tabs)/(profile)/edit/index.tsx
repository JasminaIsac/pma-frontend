import React, { useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { CustomInput, CustomButton, ChangePasswordModal, LoadingIndicator } from '@components/index';
import { colors } from '@theme/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { router } from 'expo-router';
import { z } from 'zod';
import { useMe } from '@hooks/queries/useMe';
import { useUpdateUser } from '@hooks/queries/useUsers';
import useToastNotification from '@hooks/useToastNotification';

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  location: z.string().min(2, "Location is too short"),
  tel: z
    .string()
    .min(6, "Phone number too short")
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number"),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

const EditProfile: React.FC = () => {
  const { data: user, isLoading } = useMe();
  const { mutateAsync: updateUserMutation } = useUpdateUser();
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const { showSuccess, showError } = useToastNotification();

  const { 
    control,
    reset,
    handleSubmit,
    formState: { errors, isDirty } // isDirty ne spune daca s-a schimbat ceva
} = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      location: user?.location ?? "",
      tel: user?.tel ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        location: user.location ?? "",
        tel: user.tel ?? "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (formData: EditProfileFormData) => {
    if (!user?.id) return;

    try {
      await updateUserMutation({ id: user.id, data: formData });
      showSuccess("Success", "Profile updated!");
      router.back();
    } catch (err) {
      console.error(err);
      showError("Error", "Something went wrong while updating profile.");
    }
  };

  if(isLoading) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CustomInput
        name="name"
        control={control}
        label="Name"       
        placeholder="Enter your name"
        error={errors.name?.message}
      />

      <CustomInput
        name="location"
        control={control}
        label="Location"
        placeholder="Enter your location"
        error={errors.location?.message}
      />

      <CustomInput
        name="tel"
        control={control}
        label="Phone Number"
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        error={errors.tel?.message}
      />

      <CustomButton 
        title="Save Changes" 
        onPress={handleSubmit(onSubmit)}
        disabled={!isDirty}
       />
      <CustomButton 
        title="Change Password"
        type="delete"
        onPress={() => setPasswordModalVisible(true)}
      />

      <ChangePasswordModal
        visible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
});

export default EditProfile;
