import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Controller, Control } from 'react-hook-form';
import { colors, textPresets } from '@theme/index';
import { formatDate} from '@utils/dateHelpers';

interface SelectDeadlineInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  minimumDate?: Date;
  error?: string;
}

export const SelectDeadlineInput: React.FC<SelectDeadlineInputProps> = ({
  name,
  control,
  label = 'Deadline',
  minimumDate = new Date(),
  error,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (
    onChange: (value: string) => void,
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    setShowDatePicker(false);
    if (date) {
      onChange(date.toISOString());
    }
  };

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
        render={({ field: { value, onChange } }) => (
          <>
            <View style={[styles.inputContainer, error && styles.inputError]}>
              <TextInput
                style={styles.input}
                value={formatDate(value)}
                placeholder="Select deadline"
                editable={false}
              />

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.iconContainer}
              >
                <Ionicons name="calendar-outline" size={22} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display="default"
                minimumDate={minimumDate}
                onChange={(e, d) => onDateChange(onChange, e, d)}
              />
            )}
          </>
        )}
      />

      {error && (
        <Text style={[textPresets.bodySmall, { color: colors.text.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.primary,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: colors.border.error,
    backgroundColor: colors.background.error,
  },
});