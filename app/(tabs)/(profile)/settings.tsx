import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, AppState, AppStateStatus, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, textPresets } from '@theme/index';
import { useLanguage } from '@contexts/index';
import { AppLanguage } from '@utils/i18n';
import { getCameraStatus, getMediaLibraryStatus, getNotificationStatus, PermissionStatusValue } from '@hooks/usePermissions';

const LANGUAGES: { code: AppLanguage; flag: string }[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'ro', flag: '🇷🇴' },
  { code: 'ru', flag: '🇷🇺' },
];

interface PermissionsState {
  camera: PermissionStatusValue;
  mediaLibrary: PermissionStatusValue;
  notifications: PermissionStatusValue;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const [permissions, setPermissions] = useState<PermissionsState>({
    camera: 'undetermined',
    mediaLibrary: 'undetermined',
    notifications: 'undetermined',
  });

  const checkPermissions = useCallback(async () => {
    const [camera, mediaLibrary, notifications] = await Promise.all([
      getCameraStatus(),
      getMediaLibraryStatus(),
      getNotificationStatus(),
    ]);
    setPermissions({ camera, mediaLibrary, notifications });
  }, []);

  useEffect(() => {
    checkPermissions();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkPermissions();
    });
    return () => sub.remove();
  }, [checkPermissions]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Language Section */}
      <Text style={styles.sectionTitle}>{t('settings.language.label')}</Text>
      <View style={styles.card}>
        {LANGUAGES.map((lang, index) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langRow, index < LANGUAGES.length - 1 && styles.rowBorder]}
            onPress={() => changeLanguage(lang.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.langFlag}>{lang.flag}</Text>
            <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>
              {t(`settings.language.${lang.code}`)}
            </Text>
            {language === lang.code && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Permissions Section */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>{t('settings.permissions.title')}</Text>
      <View style={styles.card}>
        <PermissionRow
          icon="camera-outline"
          label={t('settings.permissions.camera.label')}
          description={t('settings.permissions.camera.description')}
          status={permissions.camera}
          grantedText={t('settings.permissions.granted')}
          deniedText={t('settings.permissions.denied')}
          openSettingsText={t('settings.permissions.openSettings')}
          isLast={false}
        />
        <PermissionRow
          icon="images-outline"
          label={t('settings.permissions.mediaLibrary.label')}
          description={t('settings.permissions.mediaLibrary.description')}
          status={permissions.mediaLibrary}
          grantedText={t('settings.permissions.granted')}
          deniedText={t('settings.permissions.denied')}
          openSettingsText={t('settings.permissions.openSettings')}
          isLast={false}
        />
        <PermissionRow
          icon="notifications-outline"
          label={t('settings.permissions.notifications.label')}
          description={t('settings.permissions.notifications.description')}
          status={permissions.notifications}
          grantedText={t('settings.permissions.granted')}
          deniedText={t('settings.permissions.denied')}
          openSettingsText={t('settings.permissions.openSettings')}
          isLast
        />
      </View>
    </ScrollView>
  );
}

interface PermissionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  status: PermissionStatusValue;
  grantedText: string;
  deniedText: string;
  openSettingsText: string;
  isLast: boolean;
}

function PermissionRow({ icon, label, description, status, grantedText, deniedText, openSettingsText, isLast }: PermissionRowProps) {
  const granted = status === 'granted';

  return (
    <View style={[styles.permRow, !isLast && styles.rowBorder]}>
      <View style={styles.permIconWrap}>
        <Ionicons name={icon} size={22} color={colors.text.secondary} />
      </View>
      <View style={styles.permContent}>
        <Text style={styles.permLabel}>{label}</Text>
        <Text style={styles.permDesc}>{description}</Text>
        <View style={styles.permFooter}>
          <View style={[styles.badge, granted ? styles.badgeGranted : styles.badgeDenied]}>
            <Text style={[styles.badgeText, granted ? styles.badgeTextGranted : styles.badgeTextDenied]}>
              {granted ? grantedText : deniedText}
            </Text>
          </View>
          {!granted && (
            <TouchableOpacity onPress={() => Linking.openSettings()} activeOpacity={0.7}>
              <Text style={styles.openSettingsLink}>{openSettingsText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background.primary,
    flexGrow: 1,
  },
  sectionTitle: {
    ...textPresets.headerSmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionTitleSpacing: {
    marginTop: 28,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
  langFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  langLabel: {
    ...textPresets.bodyMedium,
    flex: 1,
    color: colors.text.primary,
  },
  langLabelActive: {
    ...textPresets.bodyMediumBold,
    color: colors.mediumBlue,
  },
  permRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  permIconWrap: {
    width: 32,
    marginTop: 2,
    alignItems: 'center',
  },
  permContent: {
    flex: 1,
    marginLeft: 10,
  },
  permLabel: {
    ...textPresets.bodyMediumBold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  permDesc: {
    ...textPresets.bodySmall,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  permFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeGranted: {
    backgroundColor: '#d1fae5',
  },
  badgeDenied: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextGranted: {
    color: '#065f46',
  },
  badgeTextDenied: {
    color: '#991b1b',
  },
  openSettingsLink: {
    ...textPresets.bodySmall,
    color: colors.mediumBlue,
    textDecorationLine: 'underline',
  },
});
