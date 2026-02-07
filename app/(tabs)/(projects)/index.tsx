import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@theme/colors';
import { ProjectsList, FilterSelect, CategorySelect, SortSelect, LoadingIndicator } from '@components/index';
import { sortItems, ProjectSortMethod, filterItems } from '@utils/index';
import { useProjectsCursor } from '@hooks/queries/useProjects';
import { useCategories } from '@hooks/queries/useCategories';
import { Project } from 'schemas';

const PAGE_SIZE = 10;

const AllProjectsScreen: React.FC = () => {
  const [sortMethod, setSortMethod] = useState<ProjectSortMethod>('default')
  const [filter, setFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useProjectsCursor(PAGE_SIZE)

  const { data: categories = [] } = useCategories()

  const allProjects = useMemo<Project[]>(() => {
    return data?.pages.flatMap((page: { items: any; }) => page.items) ?? []
  }, [data])

  const filteredAndSortedProjects = useMemo(() => {
    const filtered = filterItems(allProjects, 'project', {
      status: filter === 'all' ? undefined : filter,
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    });

    return sortItems(filtered, 'project', sortMethod);
  }, [allProjects, filter, selectedCategory, sortMethod]);

  if (isLoading) return <LoadingIndicator />

  return (
    <View style={styles.container}>
      <ScrollView  
        style={styles.filtersBar}
        horizontal
        contentContainerStyle={styles.filtersContent}
      >
        <SortSelect
          type="project"
          data={allProjects}
          selectedSort={sortMethod}
          onSortChange={setSortMethod}
        />

        <CategorySelect
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <FilterSelect
          type="project"
          selectedFilter={filter}
          onFilterChange={setFilter}
        />
      </ScrollView>

      <ProjectsList
        projects={filteredAndSortedProjects}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        isFetchingNextPage={isFetchingNextPage}
        style={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  filtersBar: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  filtersContent: {
    alignItems: 'center',
    gap: 8,
    flexGrow: 1,
    justifyContent: 'space-evenly',
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingBottom: 30 
  },
});

export default AllProjectsScreen;
