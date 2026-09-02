import { useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { colors } from '@theme/colors';
import { ProjectDetails, ProjectTasks, LoadingIndicator } from '@components/index';
import { ProjectMember, UserRole } from 'schemas';
import { useProject } from '@hooks/queries/useProjects';
import { useTasksByProjectId } from '@hooks/queries/useTasks';
import { useProjectMembers } from '@hooks/queries/useProjectMembers';
import { useMe } from '@hooks/queries/useMe';

const ViewProjectScreen = () => {
  const { id: projectIdParam } = useLocalSearchParams<{ id: string }>();
  const projectId = projectIdParam ? String(projectIdParam) : '';

  const router = useRouter();
  const segments = useSegments();
  const isInDashboard = segments.some((s) => s === '(dashboard)');

  const { data: user, isLoading: userLoading } = useMe();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: projectTasks = [], isLoading: tasksLoading } = useTasksByProjectId(projectId);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId);

  const editPath = isInDashboard ? '/(tabs)/(dashboard)/project-edit/[id]' : '/(tabs)/(projects)/edit/[id]';
  const membersPath = isInDashboard ? '/(tabs)/(dashboard)/members/[id]' : '/(tabs)/(projects)/members/[id]';
  const hasDevelopers = members.some((m) => m.userRole === UserRole.DEVELOPER);

  const isLoading = projectLoading || tasksLoading || membersLoading || userLoading;

  useEffect(() => {
    if (!project && !isLoading) {
      router.back();
    }
  }, [project, isLoading, router]);

  if (isLoading) return <LoadingIndicator />;
  if (!project) return null;

  return (
    <LinearGradient colors={colors.violetBlueGradient} style={styles.container}>
      {user?.role !== UserRole.DEVELOPER && (
        <Stack.Screen options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: editPath as any, params: { id: project.id } })}
                style={styles.headerButton}
              >
                <Ionicons name="pencil" size={22} color={colors.darkBlue} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: membersPath as any, params: { id: project.id } })}
                style={styles.headerButton}
              >
                <Ionicons name="person-add" size={22} color={colors.darkBlue} />
              </TouchableOpacity>
            </View>
          ),
        }} />
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProjectDetails
          project={project}
          members={members as ProjectMember[]}
        />

        <ProjectTasks
          tasks={projectTasks}
          projectId={project.id}
          user={user ?? null}
          hasDevelopers={hasDevelopers}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  headerRight: { flexDirection: 'row', marginRight: 15 },
  headerButton: { marginLeft: 15 },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: 10,
    gap: 10,
  },
});

export default ViewProjectScreen;
