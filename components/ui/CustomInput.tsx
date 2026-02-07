import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, TextInputProps } from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { colors, textPresets } from '@theme/index';

interface CustomInputProps extends TextInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  error?: string | null;
  otherstyles?: object;
  multiline?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  name,
  control,
  label,
  placeholder,
  secureTextEntry = false,
  isPassword = false,
  error = null,
  otherstyles = {},
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const shouldHideText = isPassword ? !showPassword : secureTextEntry;

  const togglePassword = () => {
    setShowPassword(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const combinedStyles = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    otherstyles,
    isPassword && { paddingRight: 40 },
  ];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[textPresets.headerSmall, { color: colors.text.primary, marginBottom: 10 }]}>
          {label}
        </Text>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={combinedStyles}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor="#666"
              secureTextEntry={shouldHideText}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              multiline={multiline}
              autoComplete="off"
              {...rest}
            />

            {isPassword && (
              <Pressable style={styles.eyeIcon} onPress={togglePassword}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="gray"
                />
              </Pressable>
            )}
          </View>
        )}
      />

      {error && (
        <Text style={[textPresets.bodySmall, { color: colors.border.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginVertical: 5 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.primary,
    marginBottom: 10,
  },
  inputFocused: {
    borderColor: colors.border.focused,
  },
  inputError: {
    borderColor: colors.border.error,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
});