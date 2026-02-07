import React, { useMemo } from 'react';
import { FlatList, Text, StyleSheet, View, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Project, ProjectStatus } from 'schemas';
import { completedLast, sortItems } from '@utils/index';
import { colors, textPresets } from '@theme/index';
import { ProjectCard } from './ProjectCard';

interface ProjectsListProps {
  style?: StyleProp<ViewStyle>;
  projects: Project[];
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  style,
  projects,
  onEndReached,
  isFetchingNextPage,
}) => {
  const router = useRouter();

  if (projects.length === 0) {
    return null;
  }
    
  const sortedProjects = useMemo(() => {
    if (!Array.isArray(projects) || projects.length === 0) {
      return [];
    }

    try {
      const sorted = sortItems(projects, 'project', 'status');
      return completedLast(sorted);
    } catch (error) {
      console.error("Sorting failed:", error);
      return projects;
    }
  }, [projects]);

  return (
    <FlatList
      style={style}
      data={sortedProjects}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ProjectCard
          item={item}
          isCompleted={item.status === ProjectStatus.COMPLETED}
          onPress={() => router.push({ pathname: "/(tabs)/(projects)/view/[id]", params: { id: item.id }})}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <Text style={[textPresets.noData, styles.noProjects]}>
          No projects found.
        </Text>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" color={colors.darkBlue} />
        ) : (
          <View style={{ height: 30 }} />
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  noProjects: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: 20,
  },
});
