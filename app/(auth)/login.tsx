import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomInput, CustomButton } from '@components/index';
import { useAuth } from '@contexts/AuthContext';
import { colors, textPresets } from '@theme/index';

const LOGO_SIZE_LARGE = 130;
const LOGO_SIZE_SMALL = 80;

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password cannot be empty'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const { login } = useAuth();
  const [logoIsSmall, setLogoIsSmall] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

// Animare logo când apare tastatura
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setLogoIsSmall(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setLogoIsSmall(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError('password', { type: 'manual', message: 'Incorrect email or password' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.logoContainer} onPress={Keyboard.dismiss}>
            <Image
              source={require('@assets/logo.png')}
              style={[
                styles.logo,
                {
                  width: logoIsSmall ? LOGO_SIZE_SMALL : LOGO_SIZE_LARGE,
                  height: logoIsSmall ? LOGO_SIZE_SMALL : LOGO_SIZE_LARGE,
                },
              ]}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Planity</Text>
          <Text style={styles.slogan}>Plan your projects with ease</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            name="email"
            control={control}
            label="Email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
          <CustomInput
            name="password"
            control={control}
            label="Password"
            placeholder="Password"
            secureTextEntry
            isPassword
            error={errors.password?.message}
          />

          <CustomButton title="Login" onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    resizeMode: 'contain',
  },
  title: {
    ...textPresets.title,
    color: colors.text.accentBlue,
    marginTop: 10,
  },
  slogan: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 15,
    marginBottom: 20,
  }
});

export default LoginScreen;
