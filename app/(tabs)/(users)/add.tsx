  import { KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
  import { useRouter } from 'expo-router';
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useForm } from 'react-hook-form';
  import { colors } from '@theme/index';
  import { CustomInput, CustomButton, LabeledPicker } from '@components/index';
  import { useCreateUser } from '@hooks/queries/useUsers';
  import { UserRole, CreateUserDTO } from 'schemas/index';
  import { useToastNotification } from '@hooks/useToastNotification';

  const rolesPicker = [
    { label: 'Project Manager', value: UserRole.PROJECT_MANAGER },
    { label: 'Developer', value: UserRole.DEVELOPER },
    { label: 'Admin', value: UserRole.ADMIN },
  ];

  const userSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    tel: z.string().min(1, 'Telephone is required'),
    role: z.nativeEnum(UserRole),
    location: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm Password is required'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

  type AddUserFormValues = z.infer<typeof userSchema>;

  const AddUserScreen = () => {
    const router = useRouter();
    const { mutate: createUser, isPending } = useCreateUser();
    const { showSuccess, showError } = useToastNotification();

    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<AddUserFormValues>({
      resolver: zodResolver(userSchema),
      defaultValues: {
        name: '',
        email: '',
        tel: '',
        role: UserRole.DEVELOPER,
        location: '',
        password: '',
        confirmPassword: '',
      },
    });

    const onSubmit = (data: AddUserFormValues) => {
      const { confirmPassword, ...payload } = data;
      createUser(payload as CreateUserDTO, {
        onSuccess: () => {
          showSuccess('Success', 'User added successfully');
          reset();
          router.back();
        },
        onError: () => {
          showError('Error', 'Failed to add user');
        },
      });
    };

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="always">
          
          <CustomInput
            control={control}
            name="name"
            label="Name"
            placeholder="Name"
            error={errors.name?.message}
          />

          <CustomInput
            control={control}
            name="email"
            label="Email"
            placeholder="Email"
            error={errors.email?.message}
          />

          <CustomInput
            control={control}
            name="tel"
            label="Tel"
            placeholder="Tel"
            keyboardType="phone-pad"
            error={errors.tel?.message}
          />

          <LabeledPicker
            control={control}
            name="role"
            label="Role"
            placeholder="Select Role"
            items={rolesPicker}
            error={errors.role?.message}
          />

          <CustomInput
            control={control}
            name="location"
            label="Location"
            placeholder="Location"
            error={errors.location?.message}
          />
        
          <CustomInput
            control={control}
            name="password"
            label="Password"
            placeholder="Password"
            isPassword
            error={errors.password?.message}
          />

          <CustomInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm Password"
            isPassword
            error={errors.confirmPassword?.message}
          />

          <CustomButton title="Add User" onPress={handleSubmit(onSubmit)} disabled={isPending} />
          <CustomButton title="Cancel" type="secondary" onPress={() => router.back()} />

        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: colors.background.primary,
    },
  });

  export default AddUserScreen;
