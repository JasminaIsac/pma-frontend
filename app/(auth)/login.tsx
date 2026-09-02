import { useState, useEffect, useMemo } from 'react';
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
  Modal,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput, CustomButton } from '@components/index';
import { useAuth } from '@contexts/AuthContext';
import { useLanguage } from '@contexts/index';
import { colors, textPresets } from '@theme/index';
import { useTranslation } from 'react-i18next';
import { AppLanguage } from '@utils/i18n';

const LANGUAGES: { code: AppLanguage; flag: string }[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'ro', flag: '🇷🇴' },
  { code: 'ru', flag: '🇷🇺' },
];

const LOGO_SIZE_LARGE = 130;
const LOGO_SIZE_SMALL = 80;

type LoginFormData = { email: string; password: string };

const LoginScreen = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const [logoIsSmall, setLogoIsSmall] = useState<boolean>(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('auth.invalidEmail')),
        password: z.string().min(1, t('auth.emptyPassword')),
      }),
    [t],
  );

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
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('password', { type: 'manual', message: t('auth.wrongCredentials') });
      } else if (!err?.response) {
        setError('password', { type: 'manual', message: t('auth.networkError') });
      } else {
        setError('password', { type: 'manual', message: t('auth.serverError') });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableOpacity style={styles.langBtn} onPress={() => setShowLangMenu(true)} activeOpacity={0.7}>
        <Ionicons name="globe-outline" size={22} color={colors.text.secondary} />
        <Text style={styles.langBtnText}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      <Modal visible={showLangMenu} transparent animationType="fade" onRequestClose={() => setShowLangMenu(false)}>
        <TouchableOpacity style={styles.langOverlay} activeOpacity={1} onPress={() => setShowLangMenu(false)}>
          <View style={styles.langDropdown}>
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langOption, index < LANGUAGES.length - 1 && styles.langOptionBorder]}
                activeOpacity={0.7}
                onPress={() => { changeLanguage(lang.code); setShowLangMenu(false); }}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langOptionText, language === lang.code && styles.langOptionTextActive]}>
                  {t(`settings.language.${lang.code}`)}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={16} color={colors.mediumBlue} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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
          <Text style={styles.slogan}>{t('auth.slogan')}</Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            name="email"
            control={control}
            label={t('auth.email')}
            placeholder={t('auth.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
          <CustomInput
            name="password"
            control={control}
            label={t('auth.password')}
            placeholder={t('auth.password')}
            secureTextEntry
            isPassword
            error={errors.password?.message}
          />

          <CustomButton title={t('auth.login')} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
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
  },
  langBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  langOverlay: {
    flex: 1,
  },
  langDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
    overflow: 'hidden',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  langOptionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
  langFlag: {
    fontSize: 20,
  },
  langOptionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  langOptionTextActive: {
    fontWeight: '700',
    color: colors.mediumBlue,
  },
});

export default LoginScreen;
