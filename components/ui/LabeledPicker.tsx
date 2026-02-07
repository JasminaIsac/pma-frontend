import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Controller, Control } from 'react-hook-form';
import { colors, textPresets } from '@theme/index';

interface PickerItem {
  label: string;
  value: string | number | null;
}

interface LabeledPickerProps {
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  items?: PickerItem[];
  error?: string;
  onValueChange?: (value: string | number | null) => void;
  rules?: any;
}

export const LabeledPicker: React.FC<LabeledPickerProps> = ({
  name,
  control,
  label,
  placeholder = "Select...",
  items = [],
  error = "",
  onValueChange,
  rules,
}) => {
  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[textPresets.headerSmall, { color: colors.text.primary }]}>
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <View style={[styles.pickerWrapper, error ? styles.pickerError : null]}>
            <Picker
              selectedValue={value}
              onValueChange={(val) => {
                onChange(val);
                onValueChange?.(val);
              }}
              style={styles.picker}
            >
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
        )}
      />

      {error ? (
        <Text style={[textPresets.bodySmall, { color: colors.text.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  pickerWrapper: {
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.primary,
    shadowColor: colors.shadow.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  picker: {
    height: 53,
    width: '100%',
  },
  pickerError: {
    borderColor: colors.border.error,
    backgroundColor: colors.background.error,
  },
});