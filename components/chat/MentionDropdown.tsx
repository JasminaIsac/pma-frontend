import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, textPresets } from '@theme/index';
import { useProjects } from '@hooks/queries/useProjects';
import { Project } from 'schemas';

interface MentionDropdownProps {
  query: string;
  onSelect: (project: Project) => void;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({ query, onSelect }) => {
  const { data: projects, isLoading } = useProjects();

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = query.toLowerCase();
    return projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [projects, query]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.mediumBlue} style={{ margin: 10 }} />
      </View>
    );
  }

  if (filtered.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="always"
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelect(item)}
            activeOpacity={0.75}
          >
            <Text style={styles.projectName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.category?.name && (
              <Text style={styles.categoryName} numberOfLines={1}>
                {item.category.name}
              </Text>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginHorizontal: 8,
    marginBottom: 4,
    overflow: 'hidden',
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  projectName: {
    ...textPresets.bodySmallBold,
    color: colors.text.primary,
    flex: 1,
  },
  categoryName: {
    ...textPresets.caption,
    color: colors.text.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.background.secondary,
  },
});
