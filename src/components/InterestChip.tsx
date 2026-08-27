import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

interface InterestChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export const InterestChip: React.FC<InterestChipProps> = ({
  label,
  selected,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onToggle}
      activeOpacity={0.7}>
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6', // light gray
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  containerSelected: {
    backgroundColor: colors.accent,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
});
