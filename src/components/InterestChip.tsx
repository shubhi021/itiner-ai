import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

interface InterestChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}

export const InterestChip: React.FC<InterestChipProps> = ({
  label,
  selected,
  onToggle,
  icon,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected ? styles.containerSelected : styles.containerUnselected]}
      onPress={onToggle}
      activeOpacity={0.7}>
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 24,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  containerUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  containerSelected: {
    backgroundColor: '#FF6B4A', // Coral
    borderWidth: 1,
    borderColor: '#FF6B4A',
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    ...typography.body,
    fontWeight: '500',
  },
  textUnselected: {
    color: '#6B7280',
  },
  textSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
