import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@theme/index';
import { TaskStatus, ProjectStatus } from 'schemas';
import { FilterOption, buildStatusOptions, formatEnum } from '@utils/index';
import { useTranslation } from 'react-i18next';

type FilterType = 'task' | 'project';

interface FilterSelectProps {
  type?: FilterType;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ type = 'task', selectedFilter, onFilterChange }) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const options: FilterOption[] = useMemo(() => {
    if (type === 'task') return buildStatusOptions(TaskStatus, t('filters.allTasks'));
    return buildStatusOptions(ProjectStatus, t('filters.allProjects'));
  }, [type, t]);

  const handleSelect = (value: string) => {
    onFilterChange(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {options.find(opt => opt.value === selectedFilter)?.label ?? t('filters.filterBy')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <FlatList<FilterOption>
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
    marginBottom: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
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
  optionItem: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
});
