import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { TaskWithRelations, Project } from 'schemas';
import { sortItems, TaskSortMethod, ProjectSortMethod } from '@utils/index';

type SortType = 'task' | 'project';

type SortValueMap = {
  task: TaskSortMethod;
  project: ProjectSortMethod;
};

type SortDataMap = {
  task: TaskWithRelations[];
  project: Project[];
};

interface SortOption<T> {
  label: string;
  value: T;
}

interface SortSelectProps<T extends SortType> {
  type: T;
  data: SortDataMap[T];
  selectedSort?: SortValueMap[T];
  onSortChange?: (value: SortValueMap[T]) => void;
  onSorted?: (sorted: SortDataMap[T]) => void;
}

const SORT_OPTIONS: { [K in SortType]: SortOption<SortValueMap[K]>[] } = {
  task: [
    { label: 'Sort By', value: 'default' },
    { label: 'Priority', value: 'priority' },
    { label: 'Status', value: 'status' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Updated At', value: 'updatedAt' },
    { label: 'Created At', value: 'createdAt' },
  ],
  project: [
    { label: 'Sort By', value: 'default' },
    { label: 'Name', value: 'name' },
    { label: 'Status', value: 'status' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ],
};

export const SortSelect = <T extends SortType>({
  type,
  data,
  selectedSort = 'default' as SortValueMap[T],
  onSortChange,
  onSorted,
}: SortSelectProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSort, setCurrentSort] =
    useState<SortValueMap[T]>(selectedSort);

  const options = useMemo(
    () => SORT_OPTIONS[type],
    [type]
  );

  const selectedLabel = useMemo(
    () => options.find(o => o.value === currentSort)?.label ?? 'Sort By',
    [options, currentSort]
  );

  const lastSentRef = React.useRef<{ sort: SortValueMap[T] | null; key: string | null }>({ sort: null, key: null });

  useEffect(() => {
    if (!onSorted) return;

    const items = data as any[];
    const key = items?.map(i => i.id).join(',') ?? String(items?.length ?? 0);
    const prev = lastSentRef.current;
    const sortChanged = currentSort !== prev.sort;
    const dataChanged = key !== prev.key;
    if (!sortChanged && !dataChanged) return;

    if (type === 'task') {
      const sorted = sortItems(items as TaskWithRelations[], 'task', currentSort as TaskSortMethod);
      onSorted(sorted as SortDataMap[T]);
    } else {
      const sorted = sortItems(items as Project[], 'project', currentSort as ProjectSortMethod);
      onSorted(sorted as SortDataMap[T]);
    }

    lastSentRef.current = { sort: currentSort, key };
  }, [data, type, currentSort, onSorted]);

  const handleSelect = useCallback(
    (value: SortValueMap[T]) => {
      setCurrentSort(value);
      onSortChange?.(value);
      setModalVisible(false);
    },
    [onSortChange]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>{selectedLabel}</Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.text.secondary}
        />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginBottom: 5 
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionItem: { paddingVertical: 10 },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
});
