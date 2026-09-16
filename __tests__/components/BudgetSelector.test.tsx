import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {BudgetSelector} from '../../src/components/BudgetSelector';

describe('BudgetSelector Component', () => {
  it('renders all budget options: Low, Medium, High', () => {
    const onSelect = jest.fn();
    const {getByText} = render(
      <BudgetSelector selectedBudget="medium" onSelect={onSelect} />,
    );

    expect(getByText('Low')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
    expect(getByText('High')).toBeTruthy();
  });

  it('triggers onSelect when user taps an option', () => {
    const onSelect = jest.fn();
    const {getByText} = render(
      <BudgetSelector selectedBudget="low" onSelect={onSelect} />,
    );

    fireEvent.press(getByText('High'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('high');

    fireEvent.press(getByText('Medium'));
    expect(onSelect).toHaveBeenCalledWith('medium');
  });
});
