import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingIndicator, MemberAvatar, ProjectsList, UserDetails } from '@components/index';
import { colors, textPresets } from '@theme/index';
import { useUser } from '@hooks/queries/useUsers';
import { useUserProjects } from '@hooks/queries/useProjectMembers';
import useToastNotification from '@hooks/useToastNotification';
import { ID } from 'schemas';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const ViewUserScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { showError } = useToastNotification();

  const { data: user, isLoading: loadingUser, isError: errorUser } = useUser(userId as ID);
  const { data: userProjects, isLoading: loadingProjects, isError: errorProjects } = useUserProjects(userId as ID);

  useEffect(() => {
    if (errorUser || errorProjects) {
      showError('Error', t('users.failedLoadData'));
    }
  }, [errorUser, errorProjects]);

  if (loadingUser) return <LoadingIndicator />;

  if (errorUser || !user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{
        headerRight: () => (
          <Ionicons
            name="pencil"
            size={24}
            color={colors.darkBlue}
            style={{ marginRight: 15 }}
            onPress={() => router.push({ pathname: '/(tabs)/(users)/edit/[id]', params: { id: userId } } as any)}
          />
        ),
      }} />
      <View style={styles.detailsContainer}>
        <UserDetails user={user} customStyles={{ padding: 20 }} />
        <MemberAvatar member={user} size={120} />
      </View>

      <View style={styles.projectsContainer}>
        <Text style={[textPresets.headerMedium, { color: colors.darkBlue, marginBottom: 10 }]}>
          {t('users.projectsInvolvedIn')}
        </Text>
        <View style={{ flex: 1 }}>
          {loadingProjects ? <LoadingIndicator /> : <ProjectsList projects={userProjects?.items || []} />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  projectsContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});

export default ViewUserScreen;
