import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, textPresets } from '@theme/index';

interface PickerItem {
  label: string;
  value: string | number | null;
}

interface SimplePickerProps {
  label?: string;
  placeholder?: string;
  value: string | number | null;
  items: PickerItem[];
  error?: string;
  onChange: (val: string | number | null) => void;
}
export const SimplePicker: React.FC<SimplePickerProps> = ({
  label,
  placeholder = 'Select...',
  value,
  items,
  error,
  onChange,
}) => {
  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[textPresets.headerSmall, { color: colors.text.primary }]}>
          {label}
        </Text>
      )}

      <View style={[styles.pickerWrapper, error && styles.error]}>
        <Picker selectedValue={value} onValueChange={onChange}>
          <Picker.Item label={placeholder} value={null} />
          {items.map((item) => (
            <Picker.Item
              key={item.value?.toString() ?? item.label}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>

      {error && (
        <Text style={[textPresets.bodySmall, { color: colors.text.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 15 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
  },
  error: {
    borderColor: colors.border.error,
    backgroundColor: colors.background.error,
  },
});