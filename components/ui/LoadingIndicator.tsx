import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@theme/index';

export const LoadingIndicator : React.FC = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.darkBlue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});