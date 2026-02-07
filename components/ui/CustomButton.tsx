import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, ViewStyle, TextStyle } from 'react-native';
import { colors, textPresets } from '@theme/index';

export type ButtonType = 'primary' | 'secondary' | 'delete' | 'disabled' | 'outline';

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  isLoading?: boolean;
  disabled?: boolean;
  type?: ButtonType;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title, 
  onPress, 
  style, 
  textStyle, 
  isLoading = false,
  disabled = false,
  type = 'primary'
}) => {
  const getButtonStyle = (): (ViewStyle | {})[] => {
    return [styles.button, styles[`${type}Button`], disabled && styles.disabledButton, style || {}];
  };

  const getTextStyle = (): (TextStyle | {})[]  => {
    return [textPresets.button, styles[`${type}Text`], disabled && styles.disabledText, textStyle || {}];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={type === 'primary' ? '#fff' : '#007AFF'} 
          size="small" 
        />
      ) : (
        <Text style={[styles.commonText, ...getTextStyle()]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryButton: {
    backgroundColor: colors.button.primary,
  },
  secondaryButton: {
    backgroundColor: colors.button.secondary,
  },
  deleteButton: {
    backgroundColor: colors.button.delete,
  },
  outlineButton: {
    backgroundColor: colors.button.outline,
    borderWidth: 2,
    borderColor: colors.border.outline,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
      },
      android: {
        elevation: 0,
      },
    }),
  },
  commonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: colors.white,
  },
  deleteText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: colors.button.disabled,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
      },
      android: {
        elevation: 0,
      },
    }),
  },
  disabledText: {
    color: '#A0A0A0',
  },
});