import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, textPresets } from '@theme/index';

interface TagProps {
  title: string;
  backgroundColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const Tag: React.FC<TagProps> = ({
  title,
  backgroundColor = colors.background.accentOrange,
  textColor = colors.darkOrange,
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <Text style={[{ color: textColor }, textPresets.tag]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
});