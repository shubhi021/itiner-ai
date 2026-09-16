import 'react-native';
import React from 'react';
import App from '../App';
import { it, describe, expect, beforeEach, afterEach } from '@jest/globals';
import renderer, { act } from 'react-test-renderer';

describe('App Root', () => {
  beforeEach(() => {
    jest.useFakeTimers(); // 1. Freeze time to avoid async timer leaks
  });

  afterEach(() => {
    jest.useRealTimers(); // 2. Clean up after the test completes
  });

  it('renders root application without crashing', () => {
    let tree: any;
    act(() => {           // 3. Ensure all state updates & effects complete
      tree = renderer.create(<App />);
    });
    expect(tree).toBeDefined(); // 4. Check that the component tree rendered
  });
});

