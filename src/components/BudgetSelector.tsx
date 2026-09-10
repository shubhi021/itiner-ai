import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Wallet, CreditCard, Gem} from 'lucide-react-native';
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
  const options: {
    label: string;
    value: Budget;
    icon: any;
  }[] = [
    {label: 'Low', value: 'low', icon: Wallet},
    {label: 'Medium', value: 'medium', icon: CreditCard},
    {label: 'High', value: 'high', icon: Gem},
  ];

  return (
    <View style={styles.container}>
      {options.map(option => {
        const isSelected = selectedBudget === option.value;
        const IconComponent = option.icon;
        const iconColor = isSelected ? '#FFFFFF' : colors.textSecondary;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.8}>
            <IconComponent size={16} color={iconColor} style={styles.icon} />
            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  icon: {
    marginRight: 6,
  },
  selectedOption: {
    backgroundColor: '#0F4C5C',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
