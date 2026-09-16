import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {InterestChip} from '../../src/components/InterestChip';

describe('InterestChip Component', () => {
  it('renders label correctly', () => {
    const onToggle = jest.fn();
    const {getByText} = render(
      <InterestChip
        label="Art & Architecture"
        selected={false}
        onToggle={onToggle}
      />,
    );

    expect(getByText('Art & Architecture')).toBeTruthy();
  });

  it('triggers onToggle callback when pressed', () => {
    const onToggle = jest.fn();
    const {getByText} = render(
      <InterestChip
        label="Culinary & Wine"
        selected={true}
        onToggle={onToggle}
      />,
    );

    fireEvent.press(getByText('Culinary & Wine'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
