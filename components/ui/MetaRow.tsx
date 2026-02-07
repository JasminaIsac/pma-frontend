import { View, Text, StyleSheet } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { Ionicons } from '@expo/vector-icons';

export const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metaRow}>
    <Ionicons name="time" size={14} color={colors.lightBlue} />
    <Text style={[textPresets.bodySmallBold, { color: colors.lightBlue }]}>
      {label}:{' '}
      <Text style={textPresets.bodySmall}>{value}</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 5,
  },
});