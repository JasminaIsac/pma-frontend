import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useProjectsCursor } from '@hooks/queries/useProjects';
import { colors, textPresets } from '@theme/index';
import { LoadingIndicator, ProjectsList, TodayProgress } from '@components/index';
import { Project } from 'schemas';

export default function Dashboard(): React.ReactElement {
  const { data, isLoading, isError } = useProjectsCursor(5);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (data) {
      const proj = data?.pages.flatMap((page: { items: any; }) => page.items) ?? [];
      setProjects(proj);
    }
  }, [data]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <View style={styles.fullScreenCenter}>
        <Text style={{ color: colors.text.error }}>Failed to load projects.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TodayProgress />
      <Text style={[textPresets.headerLarge, { paddingLeft: 8, marginBottom: 12 }]}>
        Continue with your projects:
      </Text>
      <ProjectsList projects={projects} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16,
    backgroundColor: colors.background.secondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
