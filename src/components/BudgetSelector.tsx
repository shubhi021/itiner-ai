import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

type Budget = 'low' | 'medium' | 'high';

interface BudgetSelectorProps {
  selectedBudget: Budget;
  onSelect: (budget: Budget) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  selectedBudget,
  onSelect,
}) => {
  const options: {label: string; value: Budget}[] = [
    {label: 'Low', value: 'low'},
    {label: 'Medium', value: 'medium'},
    {label: 'High', value: 'high'},
  ];

  return (
    <View style={styles.container}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            selectedBudget === option.value && styles.selectedOption,
          ]}
          onPress={() => onSelect(option.value)}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.text,
              selectedBudget === option.value && styles.selectedText,
            ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
