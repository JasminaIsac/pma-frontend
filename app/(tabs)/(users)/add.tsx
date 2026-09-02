import { useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

type AddUserFormValues = {
  name: string;
  email: string;
  tel: string;
  role: UserRole;
  location?: string;
  password: string;
  confirmPassword: string;
};

const AddUserScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();
  const { showSuccess, showError } = useToastNotification();

  const userSchema = useMemo(() => z.object({
    name: z.string().min(3, t('validation.nameMinChars', { count: 3 })),
    email: z.string().email(t('validation.invalidEmail')),
    tel: z.string()
      .min(1, t('validation.telRequired'))
      .regex(/^\+?[1-9]\d{1,14}$/, t('validation.invalidPhoneFormat')),
    role: z.nativeEnum(UserRole),
    location: z.string().optional(),
    password: z.string()
      .min(6, t('validation.passwordMin', { count: 6 }))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation.passwordComplexity')),
    confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  }), [t]);

  const rolesPicker = [
    { label: t('users.roleProjectManager'), value: UserRole.PROJECT_MANAGER },
    { label: t('users.roleDeveloper'), value: UserRole.DEVELOPER },
    { label: t('users.roleAdmin'), value: UserRole.ADMIN },
  ];

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
        showSuccess('Success', t('users.added'));
        reset();
        router.back();
      },
      onError: () => {
        showError('Error', t('users.failedAdd'));
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollViewContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >

        <CustomInput
          control={control}
          name="name"
          label={t('users.name')}
          placeholder={t('users.name')}
          error={errors.name?.message}
        />

        <CustomInput
          control={control}
          name="email"
          label={t('users.email')}
          placeholder={t('users.email')}
          error={errors.email?.message}
        />

        <CustomInput
          control={control}
          name="tel"
          label={t('users.tel')}
          placeholder={t('users.tel')}
          keyboardType="phone-pad"
          error={errors.tel?.message}
        />

        <LabeledPicker
          control={control}
          name="role"
          label={t('users.role')}
          placeholder={t('users.role')}
          items={rolesPicker}
          error={errors.role?.message}
        />

        <CustomInput
          control={control}
          name="location"
          label={t('users.location')}
          placeholder={t('users.location')}
          error={errors.location?.message}
        />

        <CustomInput
          control={control}
          name="password"
          label={t('users.password')}
          placeholder={t('users.password')}
          isPassword
          error={errors.password?.message}
        />

        <CustomInput
          control={control}
          name="confirmPassword"
          label={t('users.confirmPassword')}
          placeholder={t('users.confirmPassword')}
          isPassword
          error={errors.confirmPassword?.message}
        />

        <CustomButton title={t('users.addUser')} onPress={handleSubmit(onSubmit)} disabled={isPending} />
        <CustomButton title={t('common.cancel')} type="secondary" onPress={() => router.back()} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 60,
  },
});

export default AddUserScreen;
