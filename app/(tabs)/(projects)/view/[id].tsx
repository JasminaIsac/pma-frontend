import { useEffect, useCallback, useLayoutEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { colors } from '@theme/colors';
import { ProjectDetails, ProjectTasks, LoadingIndicator } from '@components/index';
import { ProjectMember, UserRole } from 'schemas';
import { useProject, useUpdateProject } from '@hooks/queries/useProjects';
import { useTasksByProjectId } from '@hooks/queries/useTasks';
import { useProjectMembers } from '@hooks/queries/useProjectMembers';
import { useMe } from '@hooks/queries/useMe';

const ViewProjectScreen = () => {
  const { id: projectIdParam } = useLocalSearchParams<{ id: string }>();
  const projectId = projectIdParam ? String(projectIdParam) : '';

  const navigation = useNavigation();
  const router = useRouter();

  const { data: user, isLoading: userLoading } = useMe();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: projectTasks = [], isLoading: tasksLoading } = useTasksByProjectId(projectId);
  const { data: members = [], isLoading: membersLoading } = useProjectMembers(projectId);
  const updateProjectMutation = useUpdateProject();

  useLayoutEffect(() => {
    if (!project || user?.role === UserRole.DEVELOPER) return;

    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(tabs)/(projects)/edit/[id]', params: { id: project.id } })}
            style={styles.headerButton}
          >
            <Ionicons name="pencil" size={22} color={colors.darkBlue} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(tabs)/(projects)/members/[id]', params: { id: project.id } })}
            style={styles.headerButton}
          >
            <Ionicons name="person-add" size={22} color={colors.darkBlue} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, project?.id, user?.role, router]);

  const handleTaskUpdate = useCallback(() => {
    if (!projectId) return;
    updateProjectMutation.mutate({ id: projectId, data: {} });
  }, [projectId, updateProjectMutation]);

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProjectDetails
          project={project}
          members={members as ProjectMember[]}
        />

        <ProjectTasks
          tasks={projectTasks}
          projectId={project.id}
          user={user ?? null}
          onTaskUpdate={handleTaskUpdate}
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
