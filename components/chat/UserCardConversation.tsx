import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { colors, textPresets } from '@theme/index';
import { User } from 'schemas';
import { MemberAvatar } from '../users/MemberAvatar';

interface UserCardProps {
  user: User;
  onPress?: (event: GestureResponderEvent) => void;
  selectable?: boolean;
  selected?: boolean;
}

export const UserCardConversation: React.FC<UserCardProps> = ({ user, onPress, selectable, selected }) => {
  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity 
        style={[
          styles.cardInner, 
          selectable && selected && styles.cardSelected
        ]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.mainContent}>
          <MemberAvatar member={user} size={45}/>
          
          <View style={styles.textContainer}>
            <Text style={[textPresets.headerSmall, { color: colors.text.primary, marginBottom: 0 }]}>
              {user.name}
            </Text>
            <Text style={[textPresets.bodySmall, { color: colors.text.secondary }]}>
              {user.tel}
            </Text>
          </View>
        </View>

        {selectable && (
          <View style={[styles.checkbox, selected && styles.checkboxActive]}>
            {selected && <View style={styles.checkboxInner} />}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    marginVertical: 8,
    marginHorizontal: 8,
    backgroundColor: colors.background.primary, 
    borderRadius: 20,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardInner: {
    padding: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 70,
  },
  cardSelected: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.lightBlue,
    borderWidth: 1,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border.outline || '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxActive: {
    borderColor: colors.mediumOrange,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.mediumOrange,
  },
});
